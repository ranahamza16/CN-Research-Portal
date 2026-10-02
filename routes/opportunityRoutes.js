const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

// 2.1 Create a Research Opportunity
router.post('/', opportunityController.createOpportunity);

// 2.2 Retrieve All Research Opportunities
router.get('/', opportunityController.getAllOpportunities);

// 2.3 Retrieve One Research Opportunity
router.get('/:id', opportunityController.getOpportunityById);

// 2.4 Update a Research Opportunity
router.put('/:id', opportunityController.updateOpportunity);

// 2.5 Delete a Research Opportunity
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;
