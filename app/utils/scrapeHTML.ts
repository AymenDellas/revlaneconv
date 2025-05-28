import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { validateAndNormalizeUrl } from "@/app/lib/urlUtils";

/**
 * Scrapes HTML content from a given URL using Puppeteer
 * @param url The URL to scrape
 * @returns Promise with the HTML content
 */
export async function scrapeHTML(url: string): Promise<string> {
  // Validate URL first before attempting to scrape
  const validUrl = validateAndNormalizeUrl(url);
  if (!validUrl) {
    throw new Error("Invalid URL format - please check the URL");
  }

  console.log(`[Scraper] Starting to fetch content from: ${validUrl}`);
  
  // Launch a headless browser using @sparticuz/chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: (await chromium.executablePath()) || process.env.CHROME_EXECUTABLE_PATH,
    headless: chromium.headless // headless: true is generally recommended for serverless
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL and wait for the network to be idle
    await page.goto(validUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 // 30 second timeout
    });
    
    // Wait for the body to ensure content is loaded
    await page.waitForSelector('body');
    
    // Extract the page content with structure analysis
    const content = await extractPageContent(page, validUrl);
    
    if (content.length > 100) {
      console.log(`[Scraper] Successfully extracted content with length: ${content.length}`);
      return content;
    }
    
    // If we get here, the extraction failed or returned insufficient content
    console.error('[Scraper] Extraction failed or returned insufficient content');
    throw new Error('Could not extract sufficient content from the website.');
  } catch (error: any) {
    console.error(`[Scraper] Error: ${error}`);
    throw new Error(`Failed to scrape website: ${error.message || 'Unknown error'}`);
  } finally {
    // Always close the browser
    await browser.close();
  }
}

/**
 * Extract content from the page using Puppeteer
 */
async function extractPageContent(page: any, url: string): Promise<string> {
  try {
    console.log(`[Scraper] Extracting content from: ${url}`);
    
    // Extract page title and meta description
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', (el: any) => el.getAttribute('content')).catch(() => '');
    
    // Extract all styles from the page
    const styleInfo = await extractStyles(page);
    
    // Extract color information
    const colorInfo = await extractColorInfo(page);
    
    // Analyze page structure
    const pageAnalysis = await analyzePageStructure(page, url);
    
    // Get the full HTML content
    const content = await page.content();
    
    // Create a structured HTML document with all the extracted information
    return `<html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}">
        ${styleInfo}
      </head>
      <body>
        <!-- PAGE ANALYSIS -->
        <script type="application/json" id="page-analysis">${pageAnalysis}</script>
        
        <!-- COLOR INFORMATION -->
        <div id="color-analysis">${colorInfo}</div>
        
        <!-- FULL CONTENT -->
        ${content}
      </body>
    </html>`;
  } catch (error: any) {
    console.error(`[Scraper] Error extracting content: ${error}`);
    throw error;
  }
}

/**
 * Extract all styles from the page
 */
async function extractStyles(page: any): Promise<string> {
  try {
    // Get all style tags
    const styleTagsContent = await page.evaluate(() => {
      const styleTags = Array.from(document.querySelectorAll('style'));
      return styleTags.map((tag: any) => tag.innerHTML).join('\n');
    });
    
    // Get all linked stylesheets
    const linkedStylesheets = await page.evaluate(() => {
      const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return linkTags.map((link: any) => link.getAttribute('href')).filter(Boolean);
    });
    
    // Fetch and combine linked stylesheets
    let linkedStyles = '';
    for (const href of linkedStylesheets) {
      try {
        // Handle both absolute and relative URLs
        const fullUrl = href.startsWith('http') ? href : new URL(href, page.url()).toString();
        const response = await fetch(fullUrl);
        if (response.ok) {
          linkedStyles += await response.text() + '\n';
        }
      } catch (error) {
        console.warn(`[Scraper] Could not fetch stylesheet: ${href}`);
      }
    }
    
    // Get inline styles
    const inlineStyles = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[style]'));
      return elements.map((el: any) => {
        const style = el.getAttribute('style');
        const selector = el.tagName.toLowerCase() + 
          (el.id ? `#${el.id}` : '') + 
          (el.className ? `.${el.className.replace(/\s+/g, '.')}` : '');
        return `${selector} { ${style} }`;
      }).join('\n');
    });
    
    // Combine all styles
    const allStyles = `
      <style id="extracted-styles">
        ${styleTagsContent}
        ${linkedStyles}
        ${inlineStyles}
      </style>
    `;
    
    return allStyles;
  } catch (error) {
    console.warn(`[Scraper] Error extracting styles: ${error}`);
    return '<style>/* Could not extract styles */</style>';
  }
}

/**
 * Extract color information from the page
 */
async function extractColorInfo(page: any): Promise<string> {
  try {
    const colorInfo = await page.evaluate(() => {
      const colors: Record<string, number> = {};
      
      // Function to extract colors from CSS properties
      const extractColorFromProperty = (property: string) => {
        if (!property) return;
        
        // Match hex colors
        const hexMatch = property.match(/#([0-9a-f]{3,8})/i);
        if (hexMatch) {
          const color = hexMatch[0].toLowerCase();
          colors[color] = (colors[color] || 0) + 1;
          return;
        }
        
        // Match rgb/rgba colors
        const rgbMatch = property.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/i);
        if (rgbMatch) {
          const color = rgbMatch[0].toLowerCase();
          colors[color] = (colors[color] || 0) + 1;
          return;
        }
        
        // Match named colors
        const namedColorMatch = property.match(/\b(black|white|red|green|blue|yellow|purple|gray|grey|orange|pink|brown|cyan|magenta|silver|gold|teal|navy|maroon|olive)\b/i);
        if (namedColorMatch) {
          const color = namedColorMatch[0].toLowerCase();
          colors[color] = (colors[color] || 0) + 1;
        }
      };
      
      // Extract colors from computed styles
      const elements = document.querySelectorAll('*');
      elements.forEach((el: any) => {
        const style = window.getComputedStyle(el);
        extractColorFromProperty(style.color);
        extractColorFromProperty(style.backgroundColor);
        extractColorFromProperty(style.borderColor);
      });
      
      // Sort colors by frequency
      const sortedColors = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20) // Get top 20 colors
        .map(([color, count]) => ({ color, count }));
      
      return JSON.stringify(sortedColors);
    });
    
    return colorInfo;
  } catch (error) {
    console.warn(`[Scraper] Error extracting colors: ${error}`);
    return '[]';
  }
}

/**
 * Analyze the page structure to help the AI understand what elements are present
 */
async function analyzePageStructure(page: any, url: string): Promise<string> {
  try {
    console.log(`[Scraper] Analyzing page structure for: ${url}`);
    const analysis = await page.evaluate((pageUrl: string) => {
      // Create a structured analysis of the page
      const analysisResults = {
        url: pageUrl,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        hasTestimonials: false,
        testimonialDetails: [] as Array<{selector: string, text: string, position: string, reason: string}>,
        hasTrustBadges: false,
        trustBadgeDetails: [] as string[],
        hasSocialProof: false,
        hasContactForm: false,
        formFields: [] as Array<{type: string, name: string, placeholder: string}>,
        ctaButtons: [] as Array<{text: string, href: string, position: string}>,
        navigationItems: [] as string[],
        pageStructure: [] as Array<{level: string, text: string}>
      };

      console.log('[Scraper - PageContext] Starting testimonial detection...');

      // Detect testimonials using multiple methods
      const testimonialSelectors = [
        '.testimonial', '.testimonials', '.review', '.reviews', '.feedback',
        '[class*="testimonial"]', '[class*="review"]', '[id*="testimonial"]',
        '[id*="review"]', '.quote', '.quotes', 'blockquote', '[data-testimonial]',
        'section[aria-label*="testimonial"], div[aria-label*="testimonial"]'
      ];
      
      console.log('[Scraper - PageContext] Checking selectors for testimonials:', testimonialSelectors);
      testimonialSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`[Scraper - PageContext] Selector: '${selector}', Found elements: ${elements.length}`);
        if (elements.length > 0) {
          analysisResults.hasTestimonials = true;
          elements.forEach((el, index) => {
            const textContent = el.textContent?.trim().substring(0, 150) + '...' || '';
            console.log(`[Scraper - PageContext]   - Element ${index + 1} text: ${textContent}`);
            analysisResults.testimonialDetails.push({
              selector,
              text: textContent,
              position: `selector match ${index + 1}`,
              reason: `Matched selector: ${selector}`
            });
          });
        }
      });
      
      // Look for testimonials by text content
      const testimonialKeywords = [
        'testimonial', 'review', 'what our clients say', 'what customers say',
        'customer feedback', 'client feedback', 'success story', 'case study',
        'happy customer', 'satisfied client', 'client stories', 'user review'
      ];
      console.log('[Scraper - PageContext] Checking keywords for testimonials:', testimonialKeywords);
      
      document.querySelectorAll('div, section, article, blockquote, p, li').forEach((el, index) => {
        const text = el.textContent?.toLowerCase().trim() || '';
        if (text.length > 50 && text.length < 1000) { // Only consider elements with a reasonable amount of text
            testimonialKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    analysisResults.hasTestimonials = true;
                    const existingEntry = analysisResults.testimonialDetails.find(entry => entry.text.startsWith(text.substring(0, 50)));
                    if (!existingEntry) {
                        const elementPath = el.tagName.toLowerCase() + 
                            (el.id ? `#${el.id}` : '') + 
                            (el.className && typeof el.className === 'string' ? `.${el.className.replace(/\s+/g, '.')}` : '');
                        const shortText = text.substring(0, 150) + '...';
                        console.log(`[Scraper - PageContext] Keyword '${keyword}' found in element: ${elementPath}, Text: ${shortText}`);
                        analysisResults.testimonialDetails.push({
                            selector: elementPath,
                            text: shortText,
                            position: `keyword match ${index + 1}`,
                            reason: `Matched keyword: ${keyword}`
                        });
                    }
                }
            });
        }
      });

      console.log('[Scraper - PageContext] Testimonial detection complete. Found:', analysisResults.testimonialDetails.length);
      
      // Check for trust badges
      const trustBadgeSelectors = [
        '.trust-badge', '.badge', '.certification', '.certificate',
        '[class*="trust"]', '[class*="badge"]', '[class*="certified"]',
        'img[alt*="trust"]', 'img[alt*="badge"]', 'img[alt*="certified"]',
        'img[src*="trust"]', 'img[src*="badge"]', 'img[src*="certified"]',
        '.partner-logo', '.partners', '.clients'
      ];
      
      trustBadgeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          analysisResults.hasTrustBadges = true;
          elements.forEach(el => {
            const alt = el.getAttribute('alt') || '';
            const src = el.getAttribute('src') || '';
            analysisResults.trustBadgeDetails.push(`${selector}: ${alt || src}`);
          });
        }
      });
      
      // Check for contact forms
      const forms = document.querySelectorAll('form');
      if (forms.length > 0) {
        analysisResults.hasContactForm = true;
        forms.forEach(form => {
          const inputs = form.querySelectorAll('input, textarea, select');
          inputs.forEach(input => {
            const type = input.getAttribute('type') || input.tagName.toLowerCase();
            analysisResults.formFields.push({
              type,
              name: input.getAttribute('name') || input.getAttribute('id') || '',
              placeholder: input.getAttribute('placeholder') || ''
            });
          });
        });
      }
      
      // Extract CTA buttons
      const ctaSelectors = [
        'a.button', 'button', 'a.btn', '.btn', 'a[class*="cta"]', '[class*="cta"]',
        'a.call-to-action', '.call-to-action'
      ];
      
      ctaSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          const href = el.getAttribute('href') || '';
          analysisResults.ctaButtons.push({
            text: el.textContent?.trim() || '',
            href,
            position: `${selector} ${index + 1}`
          });
        });
      });
      
      // Extract navigation items
      const navItems = document.querySelectorAll('nav a, header a, .menu a, .navigation a');
      navItems.forEach(item => {
        analysisResults.navigationItems.push(item.textContent?.trim() || '');
      });
      
      // Extract page structure (headings)
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        analysisResults.pageStructure.push({
          level: heading.tagName.toLowerCase(),
          text: heading.textContent?.trim() || ''
        });
      });
      
      return JSON.stringify(analysisResults, null, 2);
    }, url);
    
    console.log(`[Scraper] Page structure analysis result for ${url}:\n${analysis}`);
    return analysis;
  } catch (error) {
    console.warn(`[Scraper] Error analyzing page structure for ${url}: ${error}`);
    return JSON.stringify({ url, error: 'Failed to analyze page structure' });
  }
}
