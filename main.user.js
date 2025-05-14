// ==UserScript==
// @name         Steam Currency Converter
// @version      1.3
// @description  Converts Ukrainian hryvnia (₴) prices on Steam and adds a styled dropdown to adjust the scan interval. Will be adding more features in the future such as integrating all currencies
// @match        *://*.steamcommunity.com/*
// @match        *://store.steampowered.com/*
// @match        *://help.steampowered.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

	// Constants
	const GITHUB_PROJECT = 'https://github.com/AstreusCoding/Steam-Currency-Converter';
	const GITHUB_PROJECT_ISSUES = 'https://github.com/AstreusCoding/Steam-Currency-Converter/issues';
	const GITHUB_DISCUSSIONS = 'https://github.com/AstreusCoding/Steam-Currency-Converter/discussions';
    const EURO_CONVERSION_RATE = 0.02136897;  // 1 UAH to EUR
    const DEFAULT_INTERVAL_SEC = 5;
    let checkIntervalMs = DEFAULT_INTERVAL_SEC * 1000;
    let intervalId;
    const PRICE_REGEX = /(\d[\d\s.,]*)\s*₴/g;

    /** Scan and convert UAH prices under `root`. */
    function convertUAHtoEUR(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: node => node.nodeValue.includes('₴')
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT
        });

        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach(node => {
            node.nodeValue = node.nodeValue.replace(PRICE_REGEX, (_, amount) => {
                const clean = amount.replace(/\s/g, '').replace(/,/g, '.');
                const eur = (parseFloat(clean) * EURO_CONVERSION_RATE).toFixed(2);
                return `${amount.trim()} UAH (${eur} EUR)`;
            });
        });
    }

    /** Start or restart the periodic scanning. */
    function setupInterval() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => convertUAHtoEUR(document.body), checkIntervalMs);
    }

    /** Prompt user for a new interval (in seconds) and apply it. */
    function promptInterval() {
        const input = prompt('Enter scan interval in seconds:', (checkIntervalMs / 1000));
        const seconds = parseFloat(input);
        if (!isNaN(seconds) && seconds > 0) {
            checkIntervalMs = seconds * 1000;
            setupInterval();
            alert(`UAH scanner interval set to ${seconds} second(s).`);
        }
    }

    /** Injects a styled dropdown menu for settings and links. */
    function addSettingsMenu() {
        const container = document.createElement('div');
        container.className = 'as-menu svelte-ozsup';

        // Top-level button
        const button = document.createElement('button');
        button.className = 'svelte-ozsup';
        button.textContent = 'Currency Conversion Settings';
        container.appendChild(button);

        // Dropdown body
        const body = document.createElement('div');
        body.className = 'body svelte-ozsup';
        body.style.display = 'none';

        // Group 1: Settings (interval)
        const group1 = document.createElement('div');
        group1.className = 'group svelte-ozsup';
        const settingsLink = document.createElement('a');
        settingsLink.className = 'svelte-ozsup';
        settingsLink.href = '#';
        settingsLink.textContent = 'Settings';
        settingsLink.addEventListener('click', e => {
            e.preventDefault();
            promptInterval();
        });
        group1.appendChild(settingsLink);
        body.appendChild(group1);

        // Group 2: GitHub & Issue Tracker
        const group2 = document.createElement('div');
        group2.className = 'group svelte-ozsup';
        const githubLink = document.createElement('a');
        githubLink.className = 'svelte-ozsup';
        githubLink.href = GITHUB_PROJECT;
        githubLink.target = '_blank';
        githubLink.textContent = 'Contribute (GitHub)';
        group2.appendChild(githubLink);
        const reportLink = document.createElement('a');
        reportLink.className = 'svelte-ozsup';
        reportLink.href = GITHUB_PROJECT_ISSUES;
        reportLink.target = '_blank';
        reportLink.textContent = 'Report Bug / Suggest Feature';
        group2.appendChild(reportLink);
        const discussionLink = document.createElement('a');
        discussionLink.className = 'svelte-ozsup';
        discussionLink.href = GITHUB_DISCUSSIONS;
        discussionLink.target = '_blank';
        discussionLink.textContent = 'Join the Discussion';
        group2.appendChild(discussionLink);
        body.appendChild(group2);

        container.appendChild(body);

        // Toggle open/close
        button.addEventListener('click', () => {
            const isOpen = button.classList.toggle('is-open');
            body.style.display = isOpen ? 'block' : 'none';
        });

        // Insert into Steam's top bar
        const menuBar = document.getElementById('global_action_menu');
        if (menuBar) menuBar.insertBefore(container, menuBar.firstChild);
    }

    // Initialize
    convertUAHtoEUR(document.body);
    addSettingsMenu();
    setupInterval();
})();