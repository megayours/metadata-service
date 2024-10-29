import fs from 'fs';
import path from 'path';

interface Equipment {
  slot: string;
  damage?: number;
  defense?: number;
  weight: number;
  rarity: string;
  dropRate: number;
  description: string;
}

interface EquipmentTemplates {
  [name: string]: Equipment;
}

function loadTemplates(): EquipmentTemplates {
  const templatesPath = path.join(__dirname, './equipment-templates.json');
  const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
  return templates;
}

function weightedRandom(items: [string, Equipment][]): [string, Equipment] {
  const totalWeight = items.reduce((sum, [_, item]) => sum + item.dropRate, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item[1].dropRate;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[0]; // Fallback
}

function getExistingTokens(): Record<string, any> {
  const outputPath = path.join(__dirname, '../../metadata/MegaYours/Equipment.json');
  if (fs.existsSync(outputPath)) {
    return JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  }
  return {};
}

function generateTokens(count: number, startIndex: number): Record<string, any> {
  const templates = loadTemplates();
  const result: Record<string, any> = {};
  
  // Group items by slot
  const itemsBySlot = Object.entries(templates).reduce((acc, [name, item]) => {
    if (!acc[item.slot]) {
      acc[item.slot] = [];
    }
    acc[item.slot].push([name, item] as [string, Equipment]);
    return acc;
  }, {} as Record<string, [string, Equipment][]>);
  
  const slots = Object.keys(itemsBySlot);
  
  for (let i = 0; i < count; i++) {
    const tokenId = startIndex + i;
    
    // Randomly select a slot
    const slot = slots[Math.floor(Math.random() * slots.length)];
    
    // Get all items in this slot
    const slotItems = itemsBySlot[slot];
    
    // Select an item based on drop rates
    const [itemName, itemData] = weightedRandom(slotItems);
    
    // Create a copy of itemData without the dropRate
    const { dropRate, ...itemDataWithoutDropRate } = itemData;
    
    result[tokenId.toString()] = {
      name: itemName,
      ...itemDataWithoutDropRate
    };
  }
  
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const tokenCount = parseInt(args[0]) || 10; // Default to 10 if no argument provided
  
  // Get existing tokens and determine next token ID
  const existingTokens = getExistingTokens();
  const existingIds = Object.keys(existingTokens).map(id => parseInt(id));
  const startIndex = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
  
  const newTokens = generateTokens(tokenCount, startIndex);
  
  // Merge existing and new tokens
  const allTokens = {
    ...existingTokens,
    ...newTokens
  };
  
  // Ensure directory exists
  const dir = path.join(__dirname, '../../metadata/MegaYours');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the generated tokens to file
  const outputPath = path.join(dir, 'Equipment.json');
  fs.writeFileSync(outputPath, JSON.stringify(allTokens, null, 2));
  
  console.log(`Generated ${tokenCount} new tokens (${startIndex} to ${startIndex + tokenCount - 1}) in ${outputPath}`);
}

main();