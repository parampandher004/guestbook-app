/**
 * Main JavaScript for Guestbook Application
 * Handles UI interactions, theme toggling, and message management
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const messageList = document.getElementById('message-list');
  const messageForm = document.getElementById('message-form');
  const themeToggle = document.getElementById('theme-toggle');
  const messageTemplate = document.getElementById('message-template');
  const replyTemplate = document.getElementById('reply-template');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const guestbookTitle = document.getElementById('guestbook-title');
  const guestbookOwner = document.getElementById('guestbook-owner');
  const profileUpload = document.getElementById('profile-upload');
  const profilePreview = document.getElementById('profile-preview');
  const backButton = document.getElementById('back-btn');
  
  // State management
  let userVotes = JSON.parse(localStorage.getItem('guestbook_votes') || '{}');
  let profileImageData = localStorage.getItem('profile_image') || null;
  
  // Initialize the application
  const init = async () => {
    // Load settings
    loadSettings();
    
    // Load messages
    await loadMessages();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize theme
    initTheme();
    
    // Load profile image if exists
    if (profileImageData) {
      profilePreview.src = profileImageData;
    }
  };
  
  // Load guestbook settings
  const loadSettings = async () => {
    try {
      const settings = await api.getSettings();
      guestbookTitle.textContent = settings.title;
      guestbookOwner.textContent = `Created by: ${settings.owner}`;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Load messages from API
  const loadMessages = async () => {
    try {
      const messages = await api.getMessages();
      
      // Clear loading indicator
      messageList.innerHTML = '';
      
      // Render each message
      messages.forEach(message => {
        renderMessage(message);
      });
      
    } catch (error) {
      messageList.innerHTML = '<div class="error">Error loading messages. Please try again later.</div>';
      console.error('Error loading messages:', error);
    }
  };
  
  // Render a single message
  const renderMessage = (message) => {
    const messageNode = document.importNode(messageTemplate.content, true);
    const messageCard = messageNode.querySelector('.message-card');
    
    // Set message ID as data attribute
    messageCard.dataset.id = message.id;
    
    // Set message content
    messageNode.querySelector('.message-author').textContent = message.name;
    messageNode.querySelector('.message-time').textContent = formatDate(message.date);
    messageNode.querySelector('.message-content').textContent = message.message;
    
    // Set profile picture if available
    const profilePic = messageNode.querySelector('.message-profile-picture img');
    if (message.profilePic) {
      profilePic.src = message.profilePic;
      profilePic.alt = `${message.name}'s profile`;
    }
    
    // Set vote counts
    const upvoteCount = messageNode.querySelector('.upvote-count');
    const downvoteCount = messageNode.querySelector('.downvote-count');
    upvoteCount.textContent = message.upvotes;
    downvoteCount.textContent = message.downvotes;
    
    // Apply active class to buttons if user has voted
    const upvoteBtn = messageNode.querySelector('.upvote-btn');
    const downvoteBtn = messageNode.querySelector('.downvote-btn');
    
    if (userVotes[message.id] === 'upvote') {
      upvoteBtn.classList.add('active');
    } else if (userVotes[message.id] === 'downvote') {
      downvoteBtn.classList.add('active');
    }
    
    // Render replies if any
    const repliesContainer = messageNode.querySelector('.replies');
    if (message.replies && message.replies.length > 0) {
      message.replies.forEach(reply => {
        const replyNode = renderReply(reply);
        repliesContainer.appendChild(replyNode);
      });
    }
    
    // Append message to list
    messageList.appendChild(messageNode);
  };
  
  // Render a single reply
  const renderReply = (reply) => {
    const replyNode = document.importNode(replyTemplate.content, true);
    
    // Set reply content
    replyNode.querySelector('.reply-author').textContent = reply.name;
    replyNode.querySelector('.reply-time').textContent = formatDate(reply.date);
    replyNode.querySelector('.reply-content').textContent = reply.message;
    
    // Set profile picture if available
    const profilePic = replyNode.querySelector('.reply-profile-picture img');
    if (reply.profilePic) {
      profilePic.src = reply.profilePic;
      profilePic.alt = `${reply.name}'s profile`;
    }
    
    return replyNode;
  };
  
  // Submit a new message
  const submitMessage = async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !email || !message) {
      alert('Please fill out all fields');
      return;
    }
    
    try {
      const messageData = {
        name,
        email,
        message,
        profilePic: profileImageData || '/api/placeholder/40/40'
      };
      
      // Disable form while submitting
      const submitBtn = messageForm.querySelector('.btn-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
      
      // Send to API
      const newMessage = await api.addMessage(messageData);
      
      // Clear form
      messageForm.reset();
      
      // Render the new message
      renderMessage(newMessage);
      
      // Re-enable form
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post Message';
      
    } catch (error) {
      console.error('Error submitting message:', error);
      alert('Failed to post your message. Please try again.');
    }
  };
  
  // Handle voting
  const handleVote = async (messageCard, voteType) => {
    const messageId = messageCard.dataset.id;
    const upvoteBtn = messageCard.querySelector('.upvote-btn');
    const downvoteBtn = messageCard.querySelector('.downvote-btn');
    const upvoteCount = messageCard.querySelector('.upvote-count');
    const downvoteCount = messageCard.querySelector('.downvote-count');
    
    // Check if user has already voted
    const currentVote = userVotes[messageId];
    
    // If clicking the same vote type again, remove the vote
    if (currentVote === voteType) {
      try {
        // Update vote count in API
        const result = await api.updateVote(messageId, voteType, false);
        
        // Update UI
        upvoteCount.textContent = result.upvotes;
        downvoteCount.textContent = result.downvotes;
        
        // Remove active class
        if (voteType === 'upvote') {
          upvoteBtn.classList.remove('active');
        } else {
          downvoteBtn.classList.remove('active');
        }
        
        // Remove from local storage
        delete userVotes[messageId];
        localStorage.setItem('guestbook_votes', JSON.stringify(userVotes));
        
      } catch (error) {
        console.error('Error removing vote:', error);
      }
      
      return;
    }
    
    // If switching votes, remove old vote and add new one
    if (currentVote) {
      // Remove old vote
      try {
        await api.updateVote(messageId, currentVote, false);
      } catch (error) {
        console.error('Error removing previous vote:', error);
      }
    }
    
    try {
      // Add new vote
      const result = await api.updateVote(messageId, voteType, true);
      
      // Update UI
      upvoteCount.textContent = result.upvotes;
      downvoteCount.textContent = result.downvotes;
      
      // Update active classes
      upvoteBtn.classList.toggle('active', voteType === 'upvote');
      downvoteBtn.classList.toggle('active', voteType === 'downvote');
      
      // Save to local storage
      userVotes[messageId] = voteType;
      localStorage.setItem('guestbook_votes', JSON.stringify(userVotes));
      
    } catch (error) {
      console.error('Error adding vote:', error);
    }
  };
  
  // Handle reply button click
  const toggleReplyForm = (messageCard) => {
    const replyForm = messageCard.querySelector('.reply-form');
    replyForm.classList.toggle('hidden');
    
    if (!replyForm.classList.contains('hidden')) {
      replyForm.querySelector('textarea').focus();
    }
  };
  
  // Submit a reply
  const submitReply = async (messageCard) => {
    const messageId = messageCard.dataset.id;
    const replyForm = messageCard.querySelector('.reply-form');
    const replyTextarea = replyForm.querySelector('textarea');
    const replyContent = replyTextarea.value.trim();
    
    if (!replyContent) {
      alert('Please enter a reply');
      return;
    }
    
    try {
      const replyData = {
        name: nameInput.value || 'Anonymous',
        email: emailInput.value || 'anonymous@example.com',
        message: replyContent,
        profilePic: profileImageData || '/api/placeholder/30/30'
      };
      
      // Disable submit button
      const submitBtn = replyForm.querySelector('.submit-reply');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      // Send to API
      const newReply = await api.addReply(messageId, replyData);
      
      // Render the new reply
      const repliesContainer = messageCard.querySelector('.replies');
      const replyNode = renderReply(newReply);
      repliesContainer.appendChild(replyNode);
      
      // Hide reply form and clear textarea
      replyForm.classList.add('hidden');
      replyTextarea.value = '';
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to post your reply. Please try again.');
    }
  };
  
  // Handle profile image upload
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageData = event.target.result;
      profilePreview.src = imageData;
      
      // Save to local storage
      localStorage.setItem('profile_image', imageData);
      profileImageData = imageData;
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle theme toggle
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference to local storage
    localStorage.setItem('guestbook_theme', newTheme);
  };
  
  // Initialize theme from local storage or default to light
  const initTheme = () => {
    const savedTheme = localStorage.getItem('guestbook_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  };
  
  // Set up all event listeners
  const setupEventListeners = () => {
    // Form submission
    messageForm.addEventListener('submit', submitMessage);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Profile image upload
    profileUpload.addEventListener('change', handleProfileUpload);
    
    // Back button (placeholder functionality)
    backButton.addEventListener('click', () => {
      alert('This would navigate back to the guestbooks list in a real application.');
    });
    
    // Delegated events for message list
    messageList.addEventListener('click', (e) => {
      // Find closest message card
      const messageCard = e.target.closest('.message-card');
      if (!messageCard) return;
      
      // Upvote button
      if (e.target.closest('.upvote-btn')) {
        handleVote(messageCard, 'upvote');
      }
      
      // Downvote button
      if (e.target.closest('.downvote-btn')) {
        handleVote(messageCard, 'downvote');
      }
      
      // Reply button
      if (e.target.closest('.reply-btn')) {
        toggleReplyForm(messageCard);
      }
      
      // Submit reply button
      if (e.target.closest('.submit-reply')) {
        submitReply(messageCard);
      }
      
      // Cancel reply button
      if (e.target.closest('.cancel-reply')) {
        const replyForm = messageCard.querySelector('.reply-form');
        replyForm.classList.add('hidden');
        replyForm.querySelector('textarea').value = '';
      }
      
      // Options button (placeholder functionality)
      if (e.target.closest('.options-btn')) {
        alert('Message options would appear here (edit, delete, report, etc.)');
      }
    });
  };
  
  // Initialize the application
  init();
});
