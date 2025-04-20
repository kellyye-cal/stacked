const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];

function formatGameTime(ts) {
    const date = new Date(ts);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  
    return `${mm}/${dd}/${yy} ${hours}:${minutes} ${ampm}`;
}

function formatGameTimeExpanded(ts) {
    const date = new Date(ts);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const suffix = (day) => {
        if (day > 3 && day < 21) return 'th'; // Special case for 11th-20th
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
    
      return `${month} ${day}${suffix(day)}, ${year}`;
}

const formatCurrency = (amount) => {
  const absAmount = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
};

function getNetEarningsRank({earnings, investments, userID}) {
  const netEarnings = {};

  for (const player in earnings) {
    const earned = earnings[player] || 0;
    const invested = investments[player] || 0;
    netEarnings[player] = earned + invested;
  }

  const sortedEarnings = Object.entries(netEarnings).sort((a, b) => b[1] - a[1]);

  const rank = sortedEarnings.findIndex(([uID]) => uID === userID) + 1;

  return {rank, sortedEarnings};
}

module.exports = {
    formatGameTime,
    formatGameTimeExpanded,
    formatCurrency,
    getNetEarningsRank
}