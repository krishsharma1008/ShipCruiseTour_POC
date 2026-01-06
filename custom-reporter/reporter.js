// Main Reporter Script for Dashboard
let parser;
let currentFilter = 'all';
let currentSort = { column: null, direction: 'asc' };
let statusChart, suiteChart;

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    parser = new TestDataParser();
    await parser.loadData();
    initializeDashboard();
});

/**
 * Initialize the dashboard with all components
 */
function initializeDashboard() {
    updateKPIs();
    renderCharts();
    renderTestTable();
    setupEventListeners();
}

/**
 * Update KPI cards with test statistics
 */
function updateKPIs() {
    const stats = parser.getStats();
    
    // Update test date
    document.getElementById('testDate').textContent = 
        TestDataParser.formatTimestamp(stats.startTime);
    
    // Update metrics
    document.getElementById('totalTests').textContent = stats.total;
    document.getElementById('passedTests').textContent = stats.passed;
    document.getElementById('failedTests').textContent = stats.failed;
    document.getElementById('skippedTests').textContent = stats.skipped;
    
    // Calculate and update percentages
    const passedPercentage = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
    const failedPercentage = stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0;
    const skippedPercentage = stats.total > 0 ? Math.round((stats.skipped / stats.total) * 100) : 0;
    
    document.getElementById('passedPercentage').textContent = `${passedPercentage}%`;
    document.getElementById('failedPercentage').textContent = `${failedPercentage}%`;
    document.getElementById('skippedPercentage').textContent = `${skippedPercentage}%`;
    
    // Update pass rate
    document.getElementById('passRate').textContent = `${stats.passRate}%`;
    document.getElementById('passRateBar').style.width = `${stats.passRate}%`;
    
    // Update durations
    document.getElementById('totalDuration').textContent = 
        TestDataParser.formatDuration(stats.duration);
    document.getElementById('avgDuration').textContent = 
        `Avg: ${TestDataParser.formatDuration(stats.avgDuration)}`;
    
    // Update filter badges
    document.getElementById('filterAllCount').textContent = stats.total;
    document.getElementById('filterPassedCount').textContent = stats.passed;
    document.getElementById('filterFailedCount').textContent = stats.failed;
    document.getElementById('filterSkippedCount').textContent = stats.skipped;
}

/**
 * Render charts using Chart.js
 */
function renderCharts() {
    const stats = parser.getStats();
    const suiteStats = parser.getSuiteStats();
    
    // Status Distribution Pie Chart
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed', 'Skipped'],
            datasets: [{
                data: [stats.passed, stats.failed, stats.skipped],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = stats.total > 0 
                                ? Math.round((value / stats.total) * 100) 
                                : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Suite Results Bar Chart
    const suiteCtx = document.getElementById('suiteChart').getContext('2d');
    const suiteLabels = suiteStats.map(s => s.name.split(' › ').pop());
    const suiteData = {
        passed: suiteStats.map(s => s.passed),
        failed: suiteStats.map(s => s.failed),
        skipped: suiteStats.map(s => s.skipped)
    };
    
    suiteChart = new Chart(suiteCtx, {
        type: 'bar',
        data: {
            labels: suiteLabels,
            datasets: [
                {
                    label: 'Passed',
                    data: suiteData.passed,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Failed',
                    data: suiteData.failed,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Skipped',
                    data: suiteData.skipped,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Render test results table
 */
function renderTestTable() {
    const tests = getFilteredAndSortedTests();
    const tbody = document.getElementById('resultsTableBody');
    const noResults = document.getElementById('noResults');
    
    tbody.innerHTML = '';
    
    if (tests.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    tests.forEach(test => {
        const row = createTestRow(test);
        tbody.appendChild(row);
    });
}

/**
 * Create a table row for a test
 */
function createTestRow(test) {
    const tr = document.createElement('tr');
    tr.dataset.testId = test.id;
    tr.dataset.status = test.status;
    tr.dataset.suite = test.suite;
    
    // Normalize status
    let normalizedStatus = test.status;
    if (test.status === 'expected') normalizedStatus = 'passed';
    if (test.status === 'unexpected') normalizedStatus = 'failed';
    if (test.status === 'pending') normalizedStatus = 'skipped';
    
    tr.innerHTML = `
        <td>
            <div class="test-name">${escapeHtml(test.title)}</div>
            ${test.retries > 0 ? `<small style="color: var(--color-warning)">Retried ${test.retries} time(s)</small>` : ''}
        </td>
        <td>${escapeHtml(test.suite.split(' › ').pop())}</td>
        <td>
            <span class="status-badge status-${normalizedStatus}">
                ${TestDataParser.getStatusIcon(normalizedStatus)}
                ${normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
            </span>
        </td>
        <td>${TestDataParser.formatDuration(test.duration)}</td>
        <td>
            <button class="btn-details" onclick="showTestDetails('${test.id}')">
                <i class="fas fa-info-circle"></i> Details
            </button>
        </td>
    `;
    
    return tr;
}

/**
 * Get filtered and sorted tests
 */
function getFilteredAndSortedTests() {
    let tests = parser.getTests();
    
    // Apply search filter
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery) {
        tests = parser.searchTests(searchQuery);
    }
    
    // Apply status filter
    if (currentFilter !== 'all') {
        tests = tests.filter(test => {
            const status = test.status === 'expected' ? 'passed' : 
                          test.status === 'unexpected' ? 'failed' : 
                          test.status === 'pending' ? 'skipped' : 
                          test.status;
            return status === currentFilter;
        });
    }
    
    // Apply sorting
    if (currentSort.column) {
        tests = sortTests(tests, currentSort.column, currentSort.direction);
    }
    
    return tests;
}

/**
 * Sort tests by column
 */
function sortTests(tests, column, direction) {
    return [...tests].sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
            case 'name':
                aVal = a.title.toLowerCase();
                bVal = b.title.toLowerCase();
                break;
            case 'suite':
                aVal = a.suite.toLowerCase();
                bVal = b.suite.toLowerCase();
                break;
            case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
            case 'duration':
                aVal = a.duration;
                bVal = b.duration;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTestTable();
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(() => {
        renderTestTable();
    }, 300));
    
    // Sortable columns
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            // Update sort icons
            document.querySelectorAll('.sortable i').forEach(i => {
                i.className = 'fas fa-sort';
            });
            
            const icon = th.querySelector('i');
            icon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            
            renderTestTable();
        });
    });
}

/**
 * Show test details in modal
 */
function showTestDetails(testId) {
    const test = parser.getTests().find(t => t.id === testId);
    if (!test) return;
    
    const modal = document.getElementById('testModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = test.title;
    
    let statusClass = test.status === 'expected' ? 'passed' : 
                     test.status === 'unexpected' ? 'failed' : 
                     test.status === 'pending' ? 'skipped' : 
                     test.status;
    
    modalBody.innerHTML = `
        <div class="test-detail-item">
            <strong>Suite:</strong> ${escapeHtml(test.suite)}
        </div>
        <div class="test-detail-item">
            <strong>Status:</strong>
            <span class="status-badge status-${statusClass}">
                ${TestDataParser.getStatusIcon(statusClass)}
                ${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}
            </span>
        </div>
        <div class="test-detail-item">
            <strong>Duration:</strong> ${TestDataParser.formatDuration(test.duration)}
        </div>
        <div class="test-detail-item">
            <strong>File:</strong> <code>${escapeHtml(test.file)}</code>
        </div>
        ${test.retries > 0 ? `
            <div class="test-detail-item">
                <strong>Retries:</strong> ${test.retries}
            </div>
        ` : ''}
        ${test.error ? `
            <div class="error-details">
                <h4><i class="fas fa-exclamation-triangle"></i> Error Details</h4>
                <p><strong>Message:</strong> ${escapeHtml(test.error.message)}</p>
                ${test.error.stack ? `
                    <pre>${escapeHtml(test.error.stack)}</pre>
                ` : ''}
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('testModal').classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('testModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
