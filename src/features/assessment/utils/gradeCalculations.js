/**
 * Grade calculation utilities according to Circular 22/2021/TT-BGDĐT for Middle School (THCS)
 */

export const calculateTBM = (txScores = [], gkScore = null, ckScore = null) => {
  // Filter valid numeric TX scores between 0 and 10
  const validTx = txScores
    .map(s => (s !== null && s !== undefined && s !== '' ? Number(s) : null))
    .filter(s => s !== null && !isNaN(s) && s >= 0 && s <= 10);

  const validGk = (gkScore !== null && gkScore !== undefined && gkScore !== '') ? Number(gkScore) : null;
  const validCk = (ckScore !== null && ckScore !== undefined && ckScore !== '') ? Number(ckScore) : null;

  // Need at least one score to compute
  if (validTx.length === 0 && validGk === null && validCk === null) {
    return null;
  }

  let totalPoints = validTx.reduce((sum, v) => sum + v, 0);
  let totalCoefficient = validTx.length;

  if (validGk !== null && !isNaN(validGk) && validGk >= 0 && validGk <= 10) {
    totalPoints += validGk * 2;
    totalCoefficient += 2;
  }

  if (validCk !== null && !isNaN(validCk) && validCk >= 0 && validCk <= 10) {
    totalPoints += validCk * 3;
    totalCoefficient += 3;
  }

  if (totalCoefficient === 0) return null;

  const rawTbm = totalPoints / totalCoefficient;
  // Round to 1 decimal place (Standard TT 22)
  return Math.round(rawTbm * 10) / 10;
};

export const classifyPerformance = (tbm) => {
  if (tbm === null || tbm === undefined || isNaN(tbm)) {
    return { label: 'Chưa đủ điểm', color: 'bg-slate-100 text-slate-500', rank: 'N/A' };
  }

  if (tbm >= 8.0) {
    return { label: 'Tốt', color: 'bg-emerald-100 text-emerald-800 font-bold', rank: 'T' };
  } else if (tbm >= 6.5) {
    return { label: 'Khá', color: 'bg-blue-100 text-blue-800 font-bold', rank: 'K' };
  } else if (tbm >= 5.0) {
    return { label: 'Đạt', color: 'bg-amber-100 text-amber-800 font-bold', rank: 'Đ' };
  } else {
    return { label: 'Chưa đạt', color: 'bg-rose-100 text-rose-800 font-bold', rank: 'CĐ' };
  }
};
