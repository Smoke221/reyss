// config.js
const environments = {
  // home: "16.171.111.246",
  home:"192.168.0.101",
  work: "10.0.18.105"
};

// Use the ENV variable to select the environment (defaults to 'home')
const selectedEnvironment = process.env.ENV || 'home'; 

// Export the IP address for the selected environment
export const ipAddress = environments[selectedEnvironment];
