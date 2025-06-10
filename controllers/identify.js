const { Op } = require('sequelize');
const Contact = require('../models/Contact');

exports.handleIdentify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // 1. Validate input
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'At least one of email or phoneNumber is required' });
    }

    // 2. Find all matching contacts (email OR phone)
    const matchingContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : [])
        ]
      },
      order: [['createdAt', 'ASC']] // Oldest first for merging
    });

    // 3. No matches? Create a new primary contact
    if (matchingContacts.length === 0) {
      const newContact = await Contact.create({ email, phoneNumber });
      return formatResponse(res, newContact.id, [newContact.email], [newContact.phoneNumber], []);
    }

    // 4. Get the primary contact (or oldest if multiple)
    let primaryContact = matchingContacts.find(c => c.linkPrecedence === 'primary') || matchingContacts[0];

    // 5. Handle new data that needs to be added
    const newData = {
      email: email && !matchingContacts.some(c => c.email === email) ? email : null,
      phoneNumber: phoneNumber && !matchingContacts.some(c => c.phoneNumber === phoneNumber) ? phoneNumber : null
    };

    // If we have new data, create a secondary contact
    if (newData.email || newData.phoneNumber) {
      await Contact.create({
        email: newData.email,
        phoneNumber: newData.phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      });
    }

    // 6. Check if we need to merge any contacts
    if (matchingContacts.some(c => c.id !== primaryContact.id)) {
      await mergeContacts(primaryContact, matchingContacts);
    }

    // 7. Format response
    const allContacts = await fetchAllLinkedContacts(primaryContact.id);
    return formatResponse(res, primaryContact.id, allContacts.emails, allContacts.phones, allContacts.secondaryIds);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to merge contacts
async function mergeContacts(primaryContact, contactsToMerge) {
  const contactsToUpdate = contactsToMerge.filter(c => c.id !== primaryContact.id);
  
  for (const contact of contactsToUpdate) {
    // If this contact was primary, update its precedence
    if (contact.linkPrecedence === 'primary') {
      await contact.update({
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id
      });
    } else {
      // If it was already secondary, just update the linkedId
      await contact.update({
        linkedId: primaryContact.id
      });
    }
  }
}

// Helper function to fetch all linked contacts
async function fetchAllLinkedContacts(primaryId) {
  const contacts = await Contact.findAll({
    where: {
      [Op.or]: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    }
  });

  const emails = contacts.map(c => c.email).filter(Boolean);
  const phones = contacts.map(c => c.phoneNumber).filter(Boolean);
  const secondaryIds = contacts
    .filter(c => c.id !== primaryId)
    .map(c => c.id);

  return {
    emails,
    phones,
    secondaryIds
  };
}

// Helper function to format the response
function formatResponse(res, primaryId, emails, phones, secondaryIds) {
  return res.json({
    contact: {
      primaryContactId: primaryId,
      emails: [...new Set(emails)], // Remove duplicates
      phoneNumbers: [...new Set(phones)],
      secondaryContactIds: secondaryIds
    }
  });
} 