/**
 * University Research Opportunity Portal - Client Frontend JavaScript
 * Integrates directly with the Express REST API backend.
 * Features: Complete CRUD operations, real-time filtering, client-side validation,
 * Bootstrap alerts for user feedback, and modal controllers.
 */

const API_BASE = '/api/opportunities';

// State management
let opportunities = [];
let activeOpportunity = null;
let deleteTargetId = null;

// DOM Elements
const opportunitiesContainer = document.getElementById('opportunitiesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const deptFilter = document.getElementById('deptFilter');
const alertFeedbackContainer = document.getElementById('alertFeedbackContainer');

// Metrics elements
const statTotal = document.getElementById('statTotal');
const statOpen = document.getElementById('statOpen');
const statClosed = document.getElementById('statClosed');
const statPositions = document.getElementById('statPositions');

// Modal & Form elements
const opportunityModalEl = document.getElementById('opportunityModal');
const opportunityModal = new bootstrap.Modal(opportunityModalEl);
const opportunityForm = document.getElementById('opportunityForm');
const modalTitle = document.getElementById('modalTitle');
const modalAlert = document.getElementById('modalAlert');
const opportunityIdInput = document.getElementById('opportunityId');
const formTitle = document.getElementById('formTitle');
const formArea = document.getElementById('formArea');
const formDepartment = document.getElementById('formDepartment');
const formFaculty = document.getElementById('formFaculty');
const formPositions = document.getElementById('formPositions');
const formStatus = document.getElementById('formStatus');
const formDeadline = document.getElementById('formDeadline');
const formSkills = document.getElementById('formSkills');
const formDescription = document.getElementById('formDescription');
const btnSubmitText = document.getElementById('btnSubmitText');
const btnSubmitSpinner = document.getElementById('btnSubmitSpinner');

// Details Modal
const viewDetailsModalEl = document.getElementById('viewDetailsModal');
const viewDetailsModal = new bootstrap.Modal(viewDetailsModalEl);
const viewDetailsBody = document.getElementById('viewDetailsBody');
const btnEditFromDetails = document.getElementById('btnEditFromDetails');

// Delete Modal
const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
const deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);
const deleteTargetTitle = document.getElementById('deleteTargetTitle');
const deleteTargetMeta = document.getElementById('deleteTargetMeta');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnDeleteSpinner = document.getElementById('btnDeleteSpinner');

// Toast
const liveToastEl = document.getElementById('liveToast');
const liveToast = new bootstrap.Toast(liveToastEl, { delay: 4000 });
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

// ---------------------------------------------------------------------
// Feedback UI: Bootstrap Alerts & Toast Notifications
// ---------------------------------------------------------------------
function showFeedbackAlert(message, type = 'success') {
  const isDanger = type === 'danger' || type === 'error';
  const alertType = isDanger ? 'danger' : (type === 'warning' ? 'warning' : 'success');
  const iconClass = alertType === 'success' 
    ? 'bi-check-circle-fill' 
    : (alertType === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-exclamation-circle-fill');

  if (alertFeedbackContainer) {
    alertFeedbackContainer.innerHTML = `
      <div class="alert alert-${alertType} alert-dismissible fade show shadow-sm d-flex align-items-center gap-2" role="alert">
        <i class="bi ${iconClass} fs-5 flex-shrink-0"></i>
        <div class="flex-grow-1">${escapeHtml(message)}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    alertFeedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showToast(message, alertType);
}

function showToast(message, type = 'success') {
  liveToastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
  toastIcon.className = '';

  if (type === 'success') {
    liveToastEl.classList.add('bg-success');
    toastIcon.className = 'bi bi-check-circle-fill fs-5';
  } else if (type === 'danger' || type === 'error') {
    liveToastEl.classList.add('bg-danger');
    toastIcon.className = 'bi bi-exclamation-triangle-fill fs-5';
  } else if (type === 'warning') {
    liveToastEl.classList.add('bg-warning');
    toastIcon.className = 'bi bi-exclamation-circle-fill fs-5 text-dark';
  } else {
    liveToastEl.classList.add('bg-info');
    toastIcon.className = 'bi bi-info-circle-fill fs-5';
  }

  toastMessage.textContent = message;
  liveToast.show();
}

// ---------------------------------------------------------------------
// 3.1 Fetch & Display All Opportunities (Dashboard / List View)
// ---------------------------------------------------------------------
async function fetchOpportunities() {
  loadingIndicator.classList.remove('d-none');
  emptyState.classList.add('d-none');

  try {
    const params = new URLSearchParams();
    if (statusFilter.value) params.append('status', statusFilter.value);
    if (deptFilter.value) params.append('department', deptFilter.value);
    if (searchInput.value.trim()) params.append('search', searchInput.value.trim());

    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch research opportunities');
    }

    opportunities = result.data || [];
    updateMetrics();
    renderOpportunities(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    showFeedbackAlert('Failed to load opportunities: ' + error.message, 'danger');
  } finally {
    loadingIndicator.classList.add('d-none');
  }
}

// ---------------------------------------------------------------------
// Update Dashboard Metrics
// ---------------------------------------------------------------------
function updateMetrics() {
  const total = opportunities.length;
  const openCount = opportunities.filter(o => o.status === 'Open').length;
  const closedCount = opportunities.filter(o => o.status === 'Closed').length;
  const totalPositions = opportunities.reduce((acc, curr) => acc + (parseInt(curr.available_positions, 10) || 0), 0);

  statTotal.textContent = total;
  statOpen.textContent = openCount;
  statClosed.textContent = closedCount;
  statPositions.textContent = totalPositions;
}

// ---------------------------------------------------------------------
// Render Opportunities Cards with "View Details", "Edit", and "Delete"
// ---------------------------------------------------------------------
function renderOpportunities(items) {
  opportunitiesContainer.innerHTML = '';

  if (items.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');

  items.forEach(opp => {
    const isClosed = opp.status === 'Closed';
    const deadlineObj = new Date(opp.application_deadline);
    const formattedDeadline = !isNaN(deadlineObj.getTime())
      ? deadlineObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : opp.application_deadline;

    const skillsList = opp.required_skills
      ? opp.required_skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    col.innerHTML = `
      <div class="opportunity-card p-3 p-md-4 ${isClosed ? 'closed-card' : ''}">
        
        <!-- Header: Status & Positions -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge ${isClosed ? 'badge-closed' : 'badge-open'} px-2 py-1 rounded-pill">
            <i class="bi ${isClosed ? 'bi-lock-fill' : 'bi-unlock-fill'} me-1"></i>${opp.status}
          </span>
          <span class="badge bg-light text-dark border px-2 py-1">
            <i class="bi bi-person-fill me-1 text-primary"></i>${opp.available_positions} ${opp.available_positions === 1 ? 'Position' : 'Positions'}
          </span>
        </div>

        <!-- Research Title -->
        <h5 class="fw-bold text-dark mb-1" title="${escapeHtml(opp.title)}">
          ${escapeHtml(opp.title)}
        </h5>

        <!-- Area -->
        <div class="text-primary small fw-semibold mb-2">
          <i class="bi bi-tag-fill me-1"></i>${escapeHtml(opp.research_area)}
        </div>

        <!-- Faculty & Dept -->
        <div class="meta-item mb-2">
          <i class="bi bi-person-badge"></i>
          <span>${escapeHtml(opp.faculty_name)} &bull; ${escapeHtml(opp.department)}</span>
        </div>

        <!-- Description snippet -->
        <p class="text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(opp.description)}
        </p>

        <!-- Skills pills -->
        <div class="mb-3">
          ${skillsList.slice(0, 3).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
          ${skillsList.length > 3 ? `<span class="skill-tag">+${skillsList.length - 3} more</span>` : ''}
        </div>

        <!-- Deadline -->
        <div class="meta-item mb-3 pb-2 border-bottom">
          <i class="bi bi-calendar-event"></i>
          <span>Deadline: <strong>${formattedDeadline}</strong></span>
        </div>

        <!-- Actions: View Details, Edit, Status Toggle, Delete -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1">
          <button class="btn btn-sm btn-outline-primary" onclick="viewOpportunityDetails(${opp.id})">
            <i class="bi bi-eye me-1"></i> View Details
          </button>
          
          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${opp.id})" title="Edit Opportunity">
              <i class="bi bi-pencil me-1"></i> Edit
            </button>
            <button class="btn btn-sm ${isClosed ? 'btn-outline-success' : 'btn-outline-warning'}" onclick="toggleStatus(${opp.id}, '${opp.status}')" title="${isClosed ? 'Change to Open' : 'Change to Closed'}">
              <i class="bi ${isClosed ? 'bi-unlock' : 'bi-lock'}"></i> ${isClosed ? 'Open' : 'Close'}
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="promptDelete(${opp.id}, '${escapeHtml(opp.title)}')" title="Delete Opportunity">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

      </div>
    `;

    opportunitiesContainer.appendChild(col);
  });
}

// ---------------------------------------------------------------------
// 3.1 Details View: Modal displaying complete details
// ---------------------------------------------------------------------
async function viewOpportunityDetails(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Opportunity not found');
    }

    const opp = result.data;
    activeOpportunity = opp;

    const deadlineFormatted = new Date(opp.application_deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isClosed = opp.status === 'Closed';

    viewDetailsBody.innerHTML = `
      <div class="mb-3 d-flex align-items-center justify-content-between">
        <div>
          <span class="badge ${isClosed ? 'bg-secondary' : 'bg-success'} fs-6 px-3 py-2 rounded-pill me-2">
            ${opp.status}
          </span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-6 px-3 py-2 rounded-pill">
            ${opp.available_positions} Available Positions
          </span>
        </div>
        <span class="text-muted small">Database ID: #${opp.id}</span>
      </div>

      <h4 class="fw-bold text-dark mb-2">${escapeHtml(opp.title)}</h4>
      <p class="text-primary fw-medium mb-3">
        <i class="bi bi-bookmark-star-fill me-1"></i> ${escapeHtml(opp.research_area)}
      </p>

      <div class="row g-3 mb-4 bg-light p-3 rounded-3 border">
        <div class="col-sm-6">
          <small class="text-muted d-block">Faculty Supervisor</small>
          <strong>${escapeHtml(opp.faculty_name)}</strong>
        </div>
        <div class="col-sm-6">
          <small class="text-muted d-block">Department</small>
          <strong>${escapeHtml(opp.department)}</strong>
        </div>
        <div class="col-sm-6">
          <small class="text-muted d-block">Application Deadline</small>
          <strong>${deadlineFormatted}</strong>
        </div>
        <div class="col-sm-6">
          <small class="text-muted d-block">Current Status</small>
          <strong class="${isClosed ? 'text-secondary' : 'text-success'}">${opp.status}</strong>
        </div>
      </div>

      <div class="mb-3">
        <h6 class="fw-bold text-dark"><i class="bi bi-file-text me-1"></i> Research Project Description</h6>
        <p class="text-secondary" style="white-space: pre-line;">${escapeHtml(opp.description)}</p>
      </div>

      <div class="mb-3">
        <h6 class="fw-bold text-dark"><i class="bi bi-tools me-1"></i> Required Technical Skills</h6>
        <div>
          ${opp.required_skills.split(',').map(s => `<span class="badge bg-secondary-subtle text-dark me-1 mb-1 p-2">${escapeHtml(s.trim())}</span>`).join('')}
        </div>
      </div>

      <div class="text-muted small mt-4 pt-3 border-top d-flex justify-content-between">
        <span>Created: ${new Date(opp.created_at).toLocaleString()}</span>
        <span>Last Updated: ${new Date(opp.updated_at).toLocaleString()}</span>
      </div>
    `;

    btnEditFromDetails.onclick = () => {
      viewDetailsModal.hide();
      openEditModal(opp.id);
    };

    viewDetailsModal.show();
  } catch (error) {
    showFeedbackAlert(error.message, 'danger');
  }
}

// ---------------------------------------------------------------------
// 3.1 Create Form: Initializer with min future date constraint
// ---------------------------------------------------------------------
function openCreateModal() {
  opportunityForm.reset();
  opportunityForm.classList.remove('was-validated');
  opportunityIdInput.value = '';
  modalAlert.classList.add('d-none');
  modalTitle.innerHTML = '<i class="bi bi-plus-circle text-primary me-2"></i>Post New Research Opportunity';
  btnSubmitText.textContent = 'Create Opportunity';

  // Client-side validation: Set min deadline to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  formDeadline.min = tomorrow.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------
// 3.1 Update/Status Form: Pre-filled with existing data & status dropdown
// ---------------------------------------------------------------------
async function openEditModal(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Could not load opportunity for editing');
    }

    const opp = result.data;
    opportunityForm.reset();
    opportunityForm.classList.remove('was-validated');
    modalAlert.classList.add('d-none');

    opportunityIdInput.value = opp.id;
    formTitle.value = opp.title;
    formArea.value = opp.research_area;
    formDepartment.value = opp.department;
    formFaculty.value = opp.faculty_name;
    formPositions.value = opp.available_positions;
    formStatus.value = opp.status; // Open or Closed dropdown
    formDeadline.value = opp.application_deadline; // YYYY-MM-DD
    formDeadline.removeAttribute('min');
    formSkills.value = opp.required_skills;
    formDescription.value = opp.description;

    modalTitle.innerHTML = `<i class="bi bi-pencil-square text-primary me-2"></i>Edit Opportunity #${opp.id}`;
    btnSubmitText.textContent = 'Update Opportunity';

    opportunityModal.show();
  } catch (error) {
    showFeedbackAlert(error.message, 'danger');
  }
}

// ---------------------------------------------------------------------
// Form Submission & Client-Side Validation
// ---------------------------------------------------------------------
opportunityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  modalAlert.classList.add('d-none');

  const titleVal = formTitle.value.trim();
  const descVal = formDescription.value.trim();
  const areaVal = formArea.value.trim();
  const facVal = formFaculty.value.trim();
  const deptVal = formDepartment.value.trim();
  const skillsVal = formSkills.value.trim();
  const positionsVal = parseInt(formPositions.value, 10);
  const deadlineVal = formDeadline.value;
  const statusVal = formStatus.value;
  const id = opportunityIdInput.value;
  const isEditing = Boolean(id);

  // Client-side Validation 1: Required fields cannot be empty
  if (!titleVal || !descVal || !areaVal || !facVal || !deptVal || !skillsVal) {
    opportunityForm.classList.add('was-validated');
    modalAlert.textContent = 'Validation Error: Required fields cannot be empty.';
    modalAlert.classList.remove('d-none');
    return;
  }

  // Client-side Validation 2: Available positions must be > 0
  if (isNaN(positionsVal) || positionsVal <= 0) {
    opportunityForm.classList.add('was-validated');
    modalAlert.textContent = 'Validation Error: Available positions must be greater than 0.';
    modalAlert.classList.remove('d-none');
    formPositions.focus();
    return;
  }

  // Client-side Validation 3: Deadline must be provided and must be a future date when creating
  if (!deadlineVal) {
    opportunityForm.classList.add('was-validated');
    modalAlert.textContent = 'Validation Error: Please select an application deadline.';
    modalAlert.classList.remove('d-none');
    formDeadline.focus();
    return;
  }

  if (!isEditing) {
    const selectedDeadline = new Date(deadlineVal + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDeadline <= today) {
      opportunityForm.classList.add('was-validated');
      modalAlert.textContent = 'Validation Error: Application deadline must be a future date.';
      modalAlert.classList.remove('d-none');
      formDeadline.focus();
      return;
    }
  }

  const payload = {
    title: titleVal,
    description: descVal,
    research_area: areaVal,
    faculty_name: facVal,
    department: deptVal,
    required_skills: skillsVal,
    available_positions: positionsVal,
    application_deadline: deadlineVal,
    status: statusVal
  };

  btnSubmitSpinner.classList.remove('d-none');
  btnSubmitText.textContent = isEditing ? 'Updating...' : 'Creating...';

  try {
    const url = isEditing ? `${API_BASE}/${id}` : API_BASE;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || (isEditing ? 'Failed to update opportunity' : 'Failed to create opportunity'));
    }

    opportunityModal.hide();
    showFeedbackAlert(isEditing ? 'Opportunity updated successfully!' : 'Opportunity created successfully!', 'success');
    await fetchOpportunities();
  } catch (error) {
    console.error('Save error:', error);
    modalAlert.textContent = error.message;
    modalAlert.classList.remove('d-none');
  } finally {
    btnSubmitSpinner.classList.add('d-none');
    btnSubmitText.textContent = isEditing ? 'Update Opportunity' : 'Create Opportunity';
  }
});

// ---------------------------------------------------------------------
// Toggle Status between Open and Closed
// ---------------------------------------------------------------------
async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update status');
    }

    showFeedbackAlert(`Opportunity #${id} status changed to ${newStatus}!`, 'success');
    await fetchOpportunities();
  } catch (error) {
    showFeedbackAlert('Failed to update status: ' + error.message, 'danger');
  }
}

// ---------------------------------------------------------------------
// Delete Opportunity Confirmation Modal & Execution
// ---------------------------------------------------------------------
function promptDelete(id, title) {
  deleteTargetId = id;
  deleteTargetTitle.textContent = title;
  deleteTargetMeta.textContent = `Opportunity ID: #${id}`;
  deleteConfirmModal.show();
}

btnConfirmDelete.addEventListener('click', async () => {
  if (!deleteTargetId) return;

  btnDeleteSpinner.classList.remove('d-none');
  btnConfirmDelete.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/${deleteTargetId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete');
    }

    deleteConfirmModal.hide();
    showFeedbackAlert(`Opportunity #${deleteTargetId} deleted successfully!`, 'success');
    deleteTargetId = null;
    await fetchOpportunities();
  } catch (error) {
    showFeedbackAlert('Failed to delete: ' + error.message, 'danger');
  } finally {
    btnDeleteSpinner.classList.add('d-none');
    btnConfirmDelete.disabled = false;
  }
});

// ---------------------------------------------------------------------
// Search and Filter Listeners
// ---------------------------------------------------------------------
let searchDebounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchOpportunities();
  }, 300);
});

statusFilter.addEventListener('change', fetchOpportunities);
deptFilter.addEventListener('change', fetchOpportunities);

// ---------------------------------------------------------------------
// HTML Escaping Utility for XSS Prevention
// ---------------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchOpportunities();
});
