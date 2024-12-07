// config.js
const environments = {
  home: "192.168.0.104",
  work: "10.0.18.105"
};

// Use the ENV variable to select the environment (defaults to 'home')
const selectedEnvironment = process.env.ENV || 'home'; 

// Export the IP address for the selected environment
export const ipAddress = environments[selectedEnvironment];
