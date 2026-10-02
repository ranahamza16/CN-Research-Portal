-- ==========================================================
-- University Research Opportunity Portal - Seed Sample Data
-- FAST-NUCES Peshawar Campus
-- ==========================================================

USE research_portal;

INSERT INTO opportunities 
(title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status) 
VALUES
(
    'Deep Learning for Medical Image Segmentation',
    'Investigation of transformer-based architectures for multi-organ CT and MRI segmentation. Students will assist in data preparation, model training, and performance evaluation on public benchmark datasets.',
    'Artificial Intelligence & Computer Vision',
    'Dr. Tariq Rahim',
    'Computer Science',
    'Python, PyTorch, OpenCV, Basic Linear Algebra',
    2,
    '2026-11-15',
    'Open'
),
(
    'Software-Defined Networking for Smart Campus IoT',
    'Designing an energy-efficient SDN controller architecture to dynamically balance network traffic across heterogeneous IoT sensor nodes deployed in campus facilities.',
    'Computer Networks & IoT',
    'Dr. Mohammad Faisal',
    'Computer Science',
    'Mininet, Ryu SDN Controller, C++, Python, Wireshark',
    3,
    '2026-11-30',
    'Open'
),
(
    'Automated Smart Contract Vulnerability Detection',
    'Developing symbolic execution and static analysis tooling to detect re-entrancy and integer overflow vulnerabilities in Solidity smart contracts.',
    'Cyber Security & Blockchain',
    'Dr. Umar Farooq',
    'Software Engineering',
    'Solidity, Python, AST Parsing, Security Fundamentals',
    1,
    '2026-10-31',
    'Closed'
);
