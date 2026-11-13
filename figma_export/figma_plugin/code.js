// Figma Plugin Script: Generates all 8 Institutional Workstation Pages
figma.showUI(__html__, { visible: false });

async function createWorkstation() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const pages = [
    { title: "01 - Overview Dashboard (F1)", subtitle: "Executive Financial Intelligence Strip & Verified Filings" },
    { title: "02 - Entity Explorer (F2)", subtitle: "3-Region Palantir Dossier (Corporates & Survey Avenues)" },
    { title: "03 - Financial Intelligence (F3)", subtitle: "Comparative Balance Sheet, Income & Cash Flow Matrix" },
    { title: "04 - Knowledge Graph (F4)", subtitle: "Palantir-style Dark Canvas with Dijkstra Pathfinder" },
    { title: "05 - GraphRAG Copilot (F5)", subtitle: "Multi-Hop BFS Synthesis with Evidentiary Triples" },
    { title: "06 - Due Diligence Dossier (F6)", subtitle: "Verified SEC 10-K & Ind-AS Disclosures & Risk Radar" },
    { title: "07 - Options Desk (F7)", subtitle: "Black-Scholes-Merton Quant Derivatives & Greeks Chain" },
    { title: "08 - System Configuration (F8)", subtitle: "Architecture Diagnostics, Model Telemetry & Registry" }
  ];

  let startX = 0;
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const frame = figma.createFrame();
    frame.name = p.title;
    frame.resize(1440, 900);
    frame.x = startX;
    frame.y = 0;
    frame.fills = [{ type: 'SOLID', color: { r: 8/255, g: 11/255, b: 17/255 } }];

    // Top Bar
    const topBar = figma.createFrame();
    topBar.name = "Top Navigation Bar";
    topBar.resize(1440, 44);
    topBar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(topBar);

    // Left Sidebar
    const sidebar = figma.createFrame();
    sidebar.name = "Workstation Sidebar";
    sidebar.resize(200, 832);
    sidebar.x = 0;
    sidebar.y = 44;
    sidebar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(sidebar);

    // Bottom Status Bar
    const statusBar = figma.createFrame();
    statusBar.name = "Bottom Status Bar";
    statusBar.resize(1440, 24);
    statusBar.x = 0;
    statusBar.y = 876;
    statusBar.fills = [{ type: 'SOLID', color: { r: 12/255, g: 16/255, b: 23/255 } }];
    frame.appendChild(statusBar);

    // Main Content Placeholder
    const content = figma.createFrame();
    content.name = "Main Content Canvas";
    content.resize(1240, 832);
    content.x = 200;
    content.y = 44;
    content.fills = [{ type: 'SOLID', color: { r: 8/255, g: 11/255, b: 17/255 } }];

    const heading = figma.createText();
    heading.characters = p.title;
    heading.fontSize = 20;
    heading.fontName = { family: "Inter", style: "Bold" };
    heading.fills = [{ type: 'SOLID', color: { r: 56/255, g: 189/255, b: 248/255 } }];
    heading.x = 32;
    heading.y = 32;
    content.appendChild(heading);

    const sub = figma.createText();
    sub.characters = p.subtitle;
    sub.fontSize = 13;
    sub.fontName = { family: "Inter", style: "Regular" };
    sub.fills = [{ type: 'SOLID', color: { r: 148/255, g: 163/255, b: 184/255 } }];
    sub.x = 32;
    sub.y = 64;
    content.appendChild(sub);

    frame.appendChild(content);

    startX += 1520;
  }

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.closePlugin("Lavaloon Terminal UI frames created successfully!");
}

createWorkstation();
