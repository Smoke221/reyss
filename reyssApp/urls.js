const environments = {
  dev: "16.171.111.246",
  home:"192.168.0.110",
  work: "10.0.18.105"
};

const selectedEnvironment = "dev"

export const ipAddress = environments[selectedEnvironment];
