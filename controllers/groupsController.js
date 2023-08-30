// groupController.js
const db = require("../database/index");

exports.createGroup = async (req, res) => {
  try {
    const { name, description, users } = req.body;

    // Insert the group into the groups table
    const insertGroupQuery =
      "INSERT INTO `groups` (name, description) VALUES (?, ?)";
    const [insertGroupResult] = await db.query(insertGroupQuery, [
      name,
      description,
    ]);

    const groupId = insertGroupResult.insertId;
    console.log(groupId);

    // Insert group-user mappings
    if (users && users.length > 0) {
      const insertMappingsQuery = `
          INSERT INTO \`group-user-mappings\` (groupId, userId)
          VALUES ${users.map((userId) => `(${groupId}, ${userId})`).join(", ")}
        `;
      await db.query(insertMappingsQuery);
    }

    res.status(201).json({ message: "Group created successfully", groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editGroup = async (req, res) => {
  try {
    const { groupId, name, description } = req.body;

    // Update the group in the groups table
    const updateGroupQuery =
      "UPDATE `groups` SET name = ?, description = ? WHERE id = ?";
    await db.query(updateGroupQuery, [name, description, groupId]);

    res.json({ message: "Group updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addGroupMembers = async (req, res) => {
  try {
    const { groupId, users } = req.body;

    // Insert group-user mappings
    // Insert group-user mappings
    if (users && users.length > 0) {
      const insertMappingsQuery = `
          INSERT INTO \`group-user-mappings\` (groupId, userId)
          VALUES ${users.map((userId) => `(${groupId}, ${userId})`).join(", ")}
        `;
      await db.query(insertMappingsQuery);
    }

    res.json({ message: "Group members added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllGroupsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const query =
      "SELECT * FROM `groups` WHERE id IN (SELECT groupId FROM `group-user-mappings` WHERE userId = ?) LIMIT ? OFFSET ?";
    const [groups] = await db.query(query, [userId, limit, offset]);
    return res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllGroupMembers = async (req, res) => {
  try {
    const { status, groupId } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    // if status== present, then I need all the group members in that particular group
    // if status== absent, then I need all the group members who are not in that particular group
    if (status == "present") {
      const query =
        "SELECT * FROM users WHERE id IN (SELECT userId FROM `group-user-mappings` WHERE groupId = ?) LIMIT ? OFFSET ?";
      const [members] = await db.query(query, [groupId, limit, offset]);

      return res.json(members);
    } else if (status == "absent") {
      const query =
        "SELECT * FROM users WHERE id NOT IN (SELECT userId FROM `group-user-mappings` WHERE groupId = ?) LIMIT ? OFFSET ?";
      const [members] = await db.query(query, [groupId, limit, offset]);

      return res.json(members);
    }
    const query = "SELECT * FROM users  LIMIT ? OFFSET ?";
    const [members] = await db.query(query, [limit, offset]);
    return res.json(members);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
