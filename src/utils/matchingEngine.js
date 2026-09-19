/**
 * Automated Lead <-> Property Matching Engine for PropDesk CRM
 * Calculates affinity scores between buyer requirements and property inventory.
 */

export function calculatePropertyMatch(leadReq, property) {
  if (!leadReq || !property) return 0;

  let score = 0;
  let totalWeight = 0;

  // 1. Budget Match (Weight: 40)
  totalWeight += 40;
  const propPrice = Number(property.priceLakhs) || 0;
  const minBudget = Number(leadReq.budgetMinLakhs) || 0;
  const maxBudget = Number(leadReq.budgetMaxLakhs) || 0;

  if (minBudget > 0 || maxBudget > 0) {
    if (minBudget > 0 && maxBudget > 0) {
      if (propPrice >= minBudget && propPrice <= maxBudget) {
        score += 40; // Exact budget bracket
      } else if (propPrice >= minBudget * 0.85 && propPrice <= maxBudget * 1.15) {
        score += 25; // Close stretch (within 15%)
      }
    } else if (maxBudget > 0 && propPrice <= maxBudget) {
      score += 40;
    } else if (minBudget > 0 && propPrice >= minBudget) {
      score += 40;
    }
  } else {
    // No budget specified, assume neutral compatibility
    score += 20;
  }

  // 2. Locality Match (Weight: 30)
  totalWeight += 30;
  const localities = Array.isArray(leadReq.preferredLocalities)
    ? leadReq.preferredLocalities
    : (leadReq.preferredLocalities ? leadReq.preferredLocalities.split(',').map(s => s.trim()) : []);

  if (localities.length > 0) {
    const propLoc = (property.locality || '').toLowerCase();
    const propCity = (property.city || '').toLowerCase();
    const isLocMatch = localities.some(loc => {
      const l = loc.toLowerCase();
      return propLoc.includes(l) || l.includes(propLoc) || propCity.includes(l);
    });

    if (isLocMatch) {
      score += 30;
    }
  } else {
    score += 15; // Neutral
  }

  // 3. BHK / Configuration & Property Type Match (Weight: 30)
  totalWeight += 30;
  const leadBhk = (leadReq.bhk || '').toLowerCase();
  const leadType = (leadReq.propertyType || '').toLowerCase();
  const propConfig = (property.configuration || property.bhk || '').toLowerCase();
  const propType = (property.type || '').toLowerCase();

  let configMatches = false;
  let typeMatches = false;

  if (leadType && (propType.includes(leadType) || leadType.includes(propType))) {
    typeMatches = true;
  }

  if (leadBhk && (propConfig.includes(leadBhk) || leadBhk.includes(propConfig))) {
    configMatches = true;
  }

  if (typeMatches && configMatches) {
    score += 30;
  } else if (typeMatches || configMatches) {
    score += 20;
  } else if (!leadBhk && !leadType) {
    score += 15;
  }

  return Math.min(100, Math.round((score / totalWeight) * 100));
}

/**
 * Returns properties matching lead requirements, sorted by match percentage
 */
export function findMatchingProperties(leadRequirements, properties, minMatchPercent = 50) {
  if (!properties || properties.length === 0) return [];

  return properties
    .map(property => ({
      property,
      matchScore: calculatePropertyMatch(leadRequirements, property)
    }))
    .filter(item => item.matchScore >= minMatchPercent)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Returns leads matching a specific property, sorted by match percentage
 */
export function findMatchingLeads(property, leads, minMatchPercent = 50) {
  if (!leads || leads.length === 0) return [];

  return leads
    .map(lead => ({
      lead,
      matchScore: calculatePropertyMatch(lead.requirements, property)
    }))
    .filter(item => item.matchScore >= minMatchPercent)
    .sort((a, b) => b.matchScore - a.matchScore);
}
