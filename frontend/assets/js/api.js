const api = {
  async fetchWithAuth(url, options = {}) {
    try {
      // Add default headers for authenticated requests
      const response = await fetch(url, {
        ...options,
        credentials: "include", // This ensures cookies are sent
        headers: {
          ...options.headers,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        // Try to refresh the token
        const refreshResponse = await fetch(
          "/backend/routes/auth.php?action=refresh",
          {
            method: "POST",
          }
        );

        if (refreshResponse.ok) {
          // Retry the original request
          return await fetch(url, options);
        } else {
          // Redirect to login
          window.location.href = "/frontend/login";
        }
      }

      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

window.api = api;
