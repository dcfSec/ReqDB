interface Config {
  oauth: {
    provider: string
    authority: string
    client_id: string
  };
  home: {
    title: string;
    MOTD: {
      pre: string
      post: string
    };
  }
}

export const staticConfig = await getConfig()

async function getConfig(): Promise<Config> {
  let storedConfig = JSON.parse(sessionStorage.getItem("static") || "{}") || {}

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
        return {
          clientID: "",
          tenantID: ""
        }
      });
    sessionStorage.setItem("static", JSON.stringify(config));
    storedConfig = config
  }
  return storedConfig
}