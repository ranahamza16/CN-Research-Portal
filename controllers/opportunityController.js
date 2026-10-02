const { pool } = require('../config/db');

/**
 * Controller for managing University Research Opportunities
 */

// Helper to validate date format YYYY-MM-DD
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 2.1 Create a Research Opportunity
 * POST /api/opportunities
 */
exports.createOpportunity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status = 'Open'
    } = req.body;

    const missingFields = [];
    if (!title || typeof title !== 'string' || !title.trim()) missingFields.push('title');
    if (!description || typeof description !== 'string' || !description.trim()) missingFields.push('description');
    if (!research_area || typeof research_area !== 'string' || !research_area.trim()) missingFields.push('research_area');
    if (!faculty_name || typeof faculty_name !== 'string' || !faculty_name.trim()) missingFields.push('faculty_name');
    if (!department || typeof department !== 'string' || !department.trim()) missingFields.push('department');
    if (!required_skills || typeof required_skills !== 'string' || !required_skills.trim()) missingFields.push('required_skills');
    if (available_positions === undefined || available_positions === null || available_positions === '') missingFields.push('available_positions');
    if (!application_deadline) missingFields.push('application_deadline');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Missing or invalid required fields: ${missingFields.join(', ')}`
      });
    }

    const parsedPositions = parseInt(available_positions, 10);
    if (isNaN(parsedPositions) || parsedPositions <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: available_positions must be a positive integer greater than 0'
      });
    }

    if (!isValidDate(application_deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: application_deadline must be a valid date in YYYY-MM-DD format'
      });
    }

    const validStatuses = ['Open', 'Closed'];
    const sanitizedStatus = status.trim();
    if (!validStatuses.includes(sanitizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: status must be either 'Open' or 'Closed'`
      });
    }

    const insertQuery = `
      INSERT INTO opportunities 
      (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title.trim(),
      description.trim(),
      research_area.trim(),
      faculty_name.trim(),
      department.trim(),
      required_skills.trim(),
      parsedPositions,
      application_deadline.trim(),
      sanitizedStatus
    ];

    const [result] = await pool.query(insertQuery, values);

    // Retrieve the created opportunity
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2.2 Retrieve All Research Opportunities
 * GET /api/opportunities
 */
exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;

    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];

    if (status && (status === 'Open' || status === 'Closed')) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (department && department.trim() !== '') {
      query += ' AND department = ?';
      params.push(department.trim());
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR description LIKE ? OR research_area LIKE ? OR faculty_name LIKE ? OR required_skills LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2.3 Retrieve One Research Opportunity
 * GET /api/opportunities/:id
 */
exports.getOpportunityById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID. ID must be a positive integer.'
      });
    }

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2.4 Update a Research Opportunity
 * PUT /api/opportunities/:id
 */
exports.updateOpportunity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID. ID must be a positive integer.'
      });
    }

    // Check existence first
    const [existing] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status
    } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: description cannot be empty' });
      }
      updates.push('description = ?');
      values.push(description.trim());
    }

    if (research_area !== undefined) {
      if (typeof research_area !== 'string' || !research_area.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: research_area cannot be empty' });
      }
      updates.push('research_area = ?');
      values.push(research_area.trim());
    }

    if (faculty_name !== undefined) {
      if (typeof faculty_name !== 'string' || !faculty_name.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: faculty_name cannot be empty' });
      }
      updates.push('faculty_name = ?');
      values.push(faculty_name.trim());
    }

    if (department !== undefined) {
      if (typeof department !== 'string' || !department.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: department cannot be empty' });
      }
      updates.push('department = ?');
      values.push(department.trim());
    }

    if (required_skills !== undefined) {
      if (typeof required_skills !== 'string' || !required_skills.trim()) {
        return res.status(400).json({ success: false, message: 'Validation Error: required_skills cannot be empty' });
      }
      updates.push('required_skills = ?');
      values.push(required_skills.trim());
    }

    if (available_positions !== undefined) {
      const parsed = parseInt(available_positions, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: available_positions must be a positive integer greater than 0'
        });
      }
      updates.push('available_positions = ?');
      values.push(parsed);
    }

    if (application_deadline !== undefined) {
      if (!isValidDate(application_deadline)) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error: application_deadline must be a valid date in YYYY-MM-DD format'
        });
      }
      updates.push('application_deadline = ?');
      values.push(application_deadline.trim());
    }

    if (status !== undefined) {
      const validStatuses = ['Open', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: status must be either 'Open' or 'Closed'`
        });
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request: No fields provided to update'
      });
    }

    values.push(id);
    const updateQuery = `UPDATE opportunities SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(updateQuery, values);

    // Retrieve updated opportunity
    const [updated] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2.5 Delete a Research Opportunity
 * DELETE /api/opportunities/:id
 */
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity ID. ID must be a positive integer.'
      });
    }

    // Check existence first
    const [existing] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Research opportunity not found with ID: ${id}`
      });
    }

    await pool.query('DELETE FROM opportunities WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: `Research opportunity with ID ${id} deleted successfully`,
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};
