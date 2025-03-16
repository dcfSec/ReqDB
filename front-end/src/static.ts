interface Config {
  oauth: {
    provider: string
    authority: string
    client_id: string
    scope: string
  };
  home: {
    title: string;
    MOTD: {
      pre: string
      post: string
    };
  };
  login: {
    MOTD: {
      pre: string
      post: string
    };
  };
}

export const staticConfig = await getConfig()

async function getConfig(): Promise<Config> {
  let storedConfig;
  try {
    storedConfig = JSON.parse(sessionStorage.getItem("static") || "{}") || {};
  } catch (error) {
    console.error("Error parsing stored config:", error);
    storedConfig = {};
  }

  if (Object.keys(storedConfig).length === 0) {
    const config = await fetch("/api/config/static").then(response => {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.json();
    })
      .then(data => {
        return data.data
      })
      .catch(error => {
        console.error("Error:", error);
        return undefined
      });
    sessionStorage.setItem("static", JSON.stringify(config));
    storedConfig = config
  }
  return storedConfig
}