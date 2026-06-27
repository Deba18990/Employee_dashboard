const USERS = {
  admin: { password: 'admin', role: 'Admin' },
  employee: { password: 'employee', role: 'Employee' }
};

const sampleEmployees = [
  { id: 1, name: 'Alicia Nguyen', email: 'alicia@company.com', department: 'Engineering', position: 'Software Engineer' },
  { id: 2, name: 'Marcus Lee', email: 'marcus@company.com', department: 'HR', position: 'HR Manager' },
  { id: 3, name: 'Priya Shah', email: 'priya@company.com', department: 'Design', position: 'Product Designer' }
];

let employees = JSON.parse(localStorage.getItem('employee-dashboard-data')) || sampleEmployees;
let currentUser = null;
let editingId = null;

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const welcomeMessage = document.getElementById('welcomeMessage');
const currentUserRole = document.getElementById('currentUserRole');
const totalEmployees = document.getElementById('totalEmployees');
const employeeForm = document.getElementById('employeeForm');
const employeeMessage = document.getElementById('employeeMessage');
const employeeList = document.getElementById('employeeList');
const searchInput = document.getElementById('searchInput');
const logoutBtn = document.getElementById('logoutBtn');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const employeeIdInput = document.getElementById('employeeId');

function persistEmployees() {
  localStorage.setItem('employee-dashboard-data', JSON.stringify(employees));
}

function showDashboard(user) {
  currentUser = user;
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  welcomeMessage.textContent = `Welcome, ${user.username}!`;
  currentUserRole.textContent = user.role;
  totalEmployees.textContent = employees.length;
  renderEmployees();
}

function showLogin() {
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
  loginForm.reset();
  loginMessage.textContent = '';
}

function renderEmployees() {
  const query = searchInput.value.toLowerCase();
  const filtered = employees.filter((person) => {
    return [person.name, person.email, person.department, person.position].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  if (!filtered.length) {
    employeeList.innerHTML = '<p>No employees found.</p>';
    return;
  }

  employeeList.innerHTML = filtered.map((person) => `
    <article class="employee-item">
      <div>
        <strong>${person.name}</strong>
        <p>${person.position} • ${person.department}</p>
        <small>${person.email}</small>
      </div>
      <div class="actions">
        <button data-action="edit" data-id="${person.id}">Edit</button>
        <button data-action="delete" data-id="${person.id}">Delete</button>
      </div>
    </article>
  `).join('');
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const user = USERS[username];

  if (!user || user.password !== password) {
    loginMessage.textContent = 'Invalid username or password.';
    return;
  }

  loginMessage.textContent = '';
  showDashboard({ username, role: user.role });
});

employeeForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(employeeForm);
  const employee = {
    id: editingId || Date.now(),
    name: formData.get('name').toString().trim(),
    email: formData.get('email').toString().trim(),
    department: formData.get('department').toString().trim(),
    position: formData.get('position').toString().trim()
  };

  if (!employee.name || !employee.email || !employee.department || !employee.position) {
    employeeMessage.textContent = 'Please fill all employee fields.';
    return;
  }

  if (editingId) {
    employees = employees.map((item) => (item.id === editingId ? employee : item));
    employeeMessage.textContent = 'Employee updated.';
  } else {
    employees.unshift(employee);
    employeeMessage.textContent = 'Employee added.';
  }

  persistEmployees();
  editingId = null;
  employeeForm.reset();
  employeeIdInput.value = '';
  formTitle.textContent = 'Add Employee';
  submitBtn.textContent = 'Save Employee';
  totalEmployees.textContent = employees.length;
  renderEmployees();
});

employeeList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === 'edit') {
    const person = employees.find((item) => item.id === Number(id));
    if (!person) return;
    editingId = person.id;
    formTitle.textContent = 'Edit Employee';
    submitBtn.textContent = 'Update Employee';
    document.getElementById('name').value = person.name;
    document.getElementById('email').value = person.email;
    document.getElementById('department').value = person.department;
    document.getElementById('position').value = person.position;
    employeeIdInput.value = person.id;
    employeeMessage.textContent = 'Editing employee.';
  }

  if (action === 'delete') {
    employees = employees.filter((item) => item.id !== Number(id));
    persistEmployees();
    totalEmployees.textContent = employees.length;
    renderEmployees();
    employeeMessage.textContent = 'Employee deleted.';
  }
});

searchInput.addEventListener('input', renderEmployees);
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  editingId = null;
  employeeForm.reset();
  employeeIdInput.value = '';
  formTitle.textContent = 'Add Employee';
  submitBtn.textContent = 'Save Employee';
  showLogin();
});

showLogin();
