export async function getMatches(sport) {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.sofascore.com/api/v1/sport/${sport}/scheduled-events/${today}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.events;
}

export async function getStats(eventId) {
  const res = await fetch(`https://api.sofascore.com/api/v1/event/${eventId}/statistics`);
  const data = await res.json();
  return data.statistics;
}

export function getTeamImage(teamId) {
  return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
}

export async function getArticles() {
  const res = await fetch("https://blog.juegaenlinea.com/wp-json/wp/v2/posts?offset=0&per_page=6");
  return await res.json();
}
