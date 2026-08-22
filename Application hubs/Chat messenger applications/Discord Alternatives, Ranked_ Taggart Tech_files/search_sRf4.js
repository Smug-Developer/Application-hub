// ============================================
// Search Modal
// ============================================
(function() {
    'use strict';

    let index = null;
    let docs = {};
    let searchLoaded = false;
    let debounceTimer = null;

    const backdrop = document.getElementById('tt-search-modal-backdrop');
    const input = document.getElementById('tt-search-input');
    const resultsContainer = document.getElementById('tt-search-results');
    const noResults = document.getElementById('tt-search-no-results');

    // Expose globally for onclick handlers in HTML
    window.openSearchModal = openSearchModal;
    window.closeSearchModal = closeSearchModal;

    function openSearchModal() {
        backdrop.style.display = 'flex';
        document.body.classList.add('tt-search-modal-open');
        input.focus();
        if (!searchLoaded) {
            loadSearchIndex();
        }
    }

    function closeSearchModal() {
        backdrop.style.display = 'none';
        document.body.classList.remove('tt-search-modal-open');
        input.value = '';
        resultsContainer.innerHTML = '';
        noResults.style.display = 'none';
    }

    function loadSearchIndex() {
        searchLoaded = true;
        const baseUrl = document.querySelector('link[rel="alternate"]')?.href?.replace(/\/atom\.xml$/, '') || '';

        // Load elasticlunr library
        const lunrScript = document.createElement('script');
        lunrScript.src = baseUrl + '/elasticlunr.min.js';
        lunrScript.onload = function() {
            // Load search index
            const idxScript = document.createElement('script');
            idxScript.src = baseUrl + '/search_index.en.js';
            idxScript.onload = function() {
                if (window.searchIndex) {
                    index = elasticlunr.Index.load(window.searchIndex);
                    // Build docs map from index documentStore if available
                    if (index.documentStore && index.documentStore.docs) {
                        docs = index.documentStore.docs;
                    }
                }
            };
            document.head.appendChild(idxScript);
        };
        document.head.appendChild(lunrScript);
    }

    function performSearch(query) {
        if (!index || !query.trim()) {
            resultsContainer.innerHTML = '';
            noResults.style.display = 'none';
            return;
        }

        const rawResults = index.search(query, {
            fields: { title: { boost: 2 }, body: { boost: 1 } },
            expand: true
        });

        if (!rawResults || rawResults.length === 0) {
            resultsContainer.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

        const html = rawResults.slice(0, 20).map(function(res) {
            const doc = docs[res.ref] || {};
            const title = doc.title || res.ref.split('/').filter(Boolean).pop() || res.ref;
            const body = doc.body || '';
            const url = res.ref;
            const excerpt = makeExcerpt(body, terms, 200);
            const highlightedTitle = highlightTerms(title, terms);
            const highlightedExcerpt = highlightTerms(excerpt, terms);
            return '<div class="tt-search-result-item">' +
                '<a href="' + escapeHtml(url) + '" class="tt-search-result-title">' + highlightedTitle + '</a>' +
                '<p class="tt-search-result-excerpt">' + highlightedExcerpt + '</p>' +
                '</div>';
        }).join('');

        resultsContainer.innerHTML = html;
    }

    function makeExcerpt(text, terms, maxLen) {
        if (!text) return '';
        // Strip markdown-ish syntax for cleaner excerpts
        const plain = text
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/[#*_>~|`\-\[\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (plain.length <= maxLen) return plain;

        // Find first occurrence of any search term
        let bestPos = -1;
        const lower = plain.toLowerCase();
        for (let i = 0; i < terms.length; i++) {
            const pos = lower.indexOf(terms[i]);
            if (pos !== -1) {
                bestPos = pos;
                break;
            }
        }

        if (bestPos === -1) bestPos = 0;

        const start = Math.max(0, bestPos - Math.floor(maxLen / 2));
        const end = Math.min(plain.length, start + maxLen);
        let excerpt = plain.substring(start, end);
        if (start > 0) excerpt = '\u2026' + excerpt;
        if (end < plain.length) excerpt = excerpt + '\u2026';
        return excerpt;
    }

    function highlightTerms(text, terms) {
        if (!text || !terms.length) return escapeHtml(text);
        let result = escapeHtml(text);
        terms.forEach(function(term) {
            const re = new RegExp('(' + escapeRegex(term) + ')', 'gi');
            result = result.replace(re, '<mark class="tt-search-highlight">$1</mark>');
        });
        return result;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '\u0026amp;')
            .replace(/</g, '\u0026lt;')
            .replace(/>/g, '\u0026gt;')
            .replace(/"/g, '\u0026quot;');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$\u0026');
    }

    // Event listeners
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            performSearch(input.value);
        }, 150);
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSearchModal();
        }
    });

    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
            closeSearchModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.body.classList.contains('tt-search-modal-open')) {
            closeSearchModal();
        }
    });
})();
