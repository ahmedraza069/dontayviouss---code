/**
 * Wix Studio / Velo Page Code
 * Page: Trailers (Title) Dynamic Page / Details Page
 * 
 * 1. Single-Text Dynamic Breadcrumb: HOME > OUR TRAILERS > TRAILER #1
 * 2. Tiered Pricing with '$' (#daily, #weekend, #threeDay, #weekly, #monthly)
 * 3. Recommended Uses (#repeater1 -> #text2)
 */

$w.onReady(function () {
  // Access dynamic dataset (#dynamicDataset or default fallback #dataset1)
  const dataset = $w('#dynamicDataset') || $w('#dataset1');

  if (dataset) {
    dataset.onReady(() => {
      initTrailerPage(dataset);
    });

    // In case the user navigates between trailers on the dynamic page
    if (typeof dataset.onItemValuesChange === 'function') {
      dataset.onItemValuesChange(() => {
        initTrailerPage(dataset);
      });
    }
  }
});

function initTrailerPage(dataset) {
  try {
    const item = dataset.getCurrentItem();
    if (!item) return;

    // -------------------------------------------------------------
    // 1. SINGLE-TEXT DYNAMIC BREADCRUMB (HOME > OUR TRAILERS > TRAILER #1)
    // -------------------------------------------------------------
    // Extracts clean trailer title: e.g. "TRAILER #1" or "TRAILER #2"
    let trailerShortName = 'TRAILER';
    if (item.TrailerNumber ?? item.trailerNumber) {
      trailerShortName = `TRAILER #${item.TrailerNumber ?? item.trailerNumber}`;
    } else if (item.Title ?? item.title) {
      const fullTitle = String(item.Title ?? item.title);
      trailerShortName = fullTitle.includes(':') 
        ? fullTitle.split(':')[0].trim().toUpperCase() 
        : fullTitle.toUpperCase();
    }

    // Formats the entire breadcrumb inside a single HTML string
    // Matches the visual: HOME (white) > (white) OUR TRAILERS (white) > (red) TRAILER #1 (red)
    const breadcrumbHtml = `<p style="font-weight: 700; margin: 0; line-height: 1.4;">` +
      `<a href="/" style="color: #FFFFFF; text-decoration: none;">HOME</a> ` +
      `<span style="color: #FFFFFF;">&gt;</span> ` +
      `<a href="/our-trailers" style="color: #FFFFFF; text-decoration: none;">OUR TRAILERS</a> ` +
      `<span style="color: #E60000;">&gt;</span> ` +
      `<span style="color: #E60000;">${trailerShortName}</span>` +
    `</p>`;

    // Target your single breadcrumb text element ID (change '#breadcrumb' if your text ID is different)
    const breadcrumbElement = $w('#breadcrumb') || $w('#breadcrumbs') || $w('#textBreadcrumb') || $w('#breadcrumbText');
    if (breadcrumbElement) {
      breadcrumbElement.html = breadcrumbHtml;
    }

    // -------------------------------------------------------------
    // 2. FORMAT TIERED PRICING WITH '$' CURRENCY SYMBOL ($45.00)
    // -------------------------------------------------------------
    const toCurrency = (val) => {
      if (val === undefined || val === null || val === '') return '$0.00';
      if (typeof val === 'string' && val.includes('$')) return val.trim();
      const num = Number(val);
      return isNaN(num) ? `$${val}` : `$${num.toFixed(2)}`;
    };

    const dailyPrice = item.DailyRate ?? item.dailyRate ?? item.daily;
    const weekendPrice = item.WeekendRate ?? item.weekendRate ?? item.weekend;
    const threeDayPrice = item.ThreeDayRate ?? item.threeDayRate ?? item.threeDay;
    const weeklyPrice = item.WeeklyRate ?? item.weeklyRate ?? item.weekly;
    const monthlyPrice = item.MonthlyRate ?? item.monthlyRate ?? item.monthly;

    setTimeout(() => {
      if ($w('#daily')) $w('#daily').text = toCurrency(dailyPrice);
      if ($w('#weekend')) $w('#weekend').text = toCurrency(weekendPrice);
      if ($w('#threeDay')) $w('#threeDay').text = toCurrency(threeDayPrice);
      if ($w('#weekly')) $w('#weekly').text = toCurrency(weeklyPrice);
      if ($w('#monthly')) $w('#monthly').text = toCurrency(monthlyPrice);
    }, 50);

    // -------------------------------------------------------------
    // 3. RECOMMENDED USES -> #repeater1 (#text2)
    // -------------------------------------------------------------
    const rawUses = item.RecommendedUses ?? item.recommendedUses ?? item.Uses ?? item.uses ?? '';

    if (rawUses && $w('#repeater1')) {
      const usesArray = String(rawUses)
        .split(';')
        .map(u => u.replace(/&amp;/g, '&').trim())
        .filter(u => u.length > 0);

      $w('#repeater1').onItemReady(($item, itemData) => {
        if ($item('#text2')) {
          $item('#text2').text = itemData.title;
        }
      });

      $w('#repeater1').data = usesArray.map((u, i) => ({
        _id: `use_${i}_${Date.now()}`,
        title: u
      }));
    }

  } catch (err) {
    console.error('Error in initTrailerPage:', err);
  }
}
