// Papers data storage
let allPapers = [];
let filteredPapers = [];

// Load papers from JSON file
async function loadPapers() {
    try {
        const response = await fetch('data/papers.json');
        if (!response.ok) {
            throw new Error('Failed to load papers data');
        }
        const data = await response.json();
        allPapers = data.papers || [];
        filteredPapers = [...allPapers];
        
        // Update metadata
        if (data.lastUpdate) {
            updateLastUpdateTime(data.lastUpdate);
        }
        
        renderPapers();
    } catch (error) {
        console.error('Error loading papers:', error);
        showErrorMessage('Failed to load papers. Please try again later.');
    }
}

// Render papers to the page
function renderPapers() {
    const papersList = document.getElementById('papersList');
    
    if (filteredPapers.length === 0) {
        papersList.innerHTML = `
            <div class="empty-state">
                <p>No papers found. Try adjusting your filters.</p>
            </div>
        `;
        document.getElementById('paperCount').textContent = 'Total papers: 0';
        return;
    }

    papersList.innerHTML = filteredPapers.map((paper, index) => {
        const abstractTruncated = paper.abstract.length > 300;
        const displayAbstract = abstractTruncated 
            ? paper.abstract.substring(0, 300) + '...' 
            : paper.abstract;

        return `
            <div class="paper-card" style="animation-delay: ${index * 0.1}s">
                <div class="paper-title">
                    <a href="${paper.arxivUrl}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(paper.title)}
                    </a>
                </div>
                
                <div class="paper-meta">
                    <div class="paper-authors">
                        <strong>Authors:</strong> ${escapeHtml(paper.authors)}
                    </div>
                    <div class="paper-date">📅 ${formatDate(paper.publishedDate)}</div>
                    <div class="paper-category">🏷️ ${escapeHtml(paper.category)}</div>
                </div>

                <div class="paper-abstract ${abstractTruncated ? 'truncated' : ''}">
                    ${escapeHtml(displayAbstract)}
                </div>

                <div class="paper-links">
                    <a href="${paper.arxivUrl}" target="_blank" rel="noopener noreferrer" class="paper-link">
                        📄 View on arXiv
                    </a>
                    <a href="${paper.pdfUrl}" target="_blank" rel="noopener noreferrer" class="paper-link pdf">
                        📥 Download PDF
                    </a>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('paperCount').textContent = `Total papers: ${filteredPapers.length}`;
}

// Filter papers by category
function filterByCategory(category) {
    if (category === '') {
        filteredPapers = [...allPapers];
    } else {
        filteredPapers = allPapers.filter(paper => 
            paper.category.toLowerCase().includes(category.toLowerCase())
        );
    }
    renderPapers();
}

// Format date to readable format
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString;
    }
}

// Update last update time
function updateLastUpdateTime(timestamp) {
    try {
        const date = new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formatted = date.toLocaleDateString('en-US', options);
        document.getElementById('lastUpdate').textContent = `Last updated: ${formatted}`;
    } catch (e) {
        document.getElementById('lastUpdate').textContent = `Last updated: ${timestamp}`;
    }
}

// Show error message
function showErrorMessage(message) {
    const papersList = document.getElementById('papersList');
    papersList.innerHTML = `
        <div class="empty-state">
            <p>⚠️ ${message}</p>
        </div>
    `;
}

// Escape HTML to prevent XSS
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

// Set up event listeners
function setupEventListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPapers();
});
