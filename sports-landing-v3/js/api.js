export async function getMatches(sport) {
  
  const today = new Date().toISOString().split('T')[0];

  const url = `https://webws.365scores.com/web/games/allscores/?appTypeId=5&langId=14&timezoneName=America/Caracas&userCountryId=110&sports=${sport}&startDate=${today}&endDate=${today}&showOdds=true&onlyMajorGames=true&withTop=true&topBookmaker=16"`;
  const res = await fetch(url);
  const {games}= await res.json();
 
  return games;
}

export async function getStats(eventId) {
 const res2= await fetch( `https://webws.365scores.com/web/stats/preGame?appTypeId=5&langId=14&timezoneName=America/Caracas&userCountryId=110&game=${eventId}&topBookmaker=16`)
  const {statistics} = await res2.json();
  return statistics;
}

export function getTeamImage(teamId) {
  return `https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Competitors:default1.png/v4/Competitors/${teamId}"`;
}

export async function getArticles() {
  const res = await fetch(" https://blog.juegaenlinea.com/wp-json/wp/v2/posts?offset=0&per_page=6");
  return await res.json();
}
