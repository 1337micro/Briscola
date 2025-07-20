/**
 * Browser-side AI configuration utilities
 */

/**
 * Global AI configuration object
 */
window.BriscolaAI = {
    currentType: 'rule-based',
    drlAgent: null,
    
    /**
     * Set AI type for the game
     * @param {string} type - 'rule-based' or 'drl'
     */
    setAIType: function(type) {
        this.currentType = type;
        console.log(`AI type set to: ${type}`);
        
        // Update game if it exists
        if (window.currentGame) {
            window.currentGame.setAIType(type);
        }
    },
    
    /**
     * Get current AI type
     * @returns {string} Current AI type
     */
    getAIType: function() {
        return this.currentType;
    },
    
    /**
     * Initialize DRL agent for browser use
     */
    initializeDRL: async function() {
        try {
            if (!window.tf) {
                throw new Error('TensorFlow.js not loaded');
            }
            
            // Import DRL modules (would need to be bundled for browser)
            console.log('DRL AI available in browser mode');
            return true;
        } catch (error) {
            console.warn('DRL AI not available:', error.message);
            return false;
        }
    },
    
    /**
     * Check if DRL is available
     * @returns {boolean} True if DRL can be used
     */
    isDRLAvailable: function() {
        return window.tf !== undefined;
    }
};

/**
 * Add AI configuration UI to the game page
 */
function addAIConfigurationUI() {
    // Check if we're on the game page
    if (!document.getElementById('greeting')) {
        return;
    }
    
    // Create AI configuration panel
    const configPanel = document.createElement('div');
    configPanel.id = 'ai-config-panel';
    configPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        z-index: 1000;
        min-width: 200px;
    `;
    
    configPanel.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">AI Configuration</h4>
        <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px;">
                <input type="radio" name="aiType" value="rule-based" checked style="margin-right: 5px;">
                Rule-based AI
            </label>
            <label style="display: block;">
                <input type="radio" name="aiType" value="drl" style="margin-right: 5px;">
                DRL AI (Neural Network)
            </label>
        </div>
        <div id="ai-status" style="font-size: 12px; color: #ccc;">
            Current: Rule-based AI
        </div>
        <div style="margin-top: 10px;">
            <button id="toggle-ai-panel" style="background: #333; color: white; border: 1px solid #666; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Hide
            </button>
        </div>
    `;
    
    document.body.appendChild(configPanel);
    
    // Add event listeners
    const radioButtons = configPanel.querySelectorAll('input[name="aiType"]');
    const statusDiv = configPanel.querySelector('#ai-status');
    const toggleButton = configPanel.querySelector('#toggle-ai-panel');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const aiType = this.value;
                window.BriscolaAI.setAIType(aiType);
                
                if (aiType === 'drl') {
                    if (!window.BriscolaAI.isDRLAvailable()) {
                        statusDiv.innerHTML = 'Current: DRL AI (TensorFlow.js not loaded)';
                        statusDiv.style.color = '#ff6666';
                    } else {
                        statusDiv.innerHTML = 'Current: DRL AI (Neural Network)';
                        statusDiv.style.color = '#66ff66';
                    }
                } else {
                    statusDiv.innerHTML = 'Current: Rule-based AI';
                    statusDiv.style.color = '#ccc';
                }
            }
        });
    });
    
    // Toggle panel visibility
    let isHidden = false;
    toggleButton.addEventListener('click', function() {
        const content = configPanel.querySelector('div');
        if (isHidden) {
            content.style.display = 'block';
            this.textContent = 'Hide';
            isHidden = false;
        } else {
            content.style.display = 'none';
            this.textContent = 'Show AI Config';
            isHidden = true;
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AI system
    window.BriscolaAI.initializeDRL();
    
    // Add configuration UI
    addAIConfigurationUI();
    
    console.log('Briscola AI system initialized');
    console.log('TensorFlow.js available:', window.BriscolaAI.isDRLAvailable());
});

export { }; // Make this a module