const timesOfDay = [
    "Early Morning", "Morning", "Late Morning", 
    "Afternoon", "Evening", "Sunset", 
    "Twilight", "Night", "Midnight"
];

const weatherTypes = [
    "🌤️ Clear", "☀️ Sunny", "⛅ Cloudy", "☁️ Overcast", 
    "🌦️ Light Rain", "🌧️ Rain", "⛈️ Heavy Rain", "🌩️ Storm"
];

// Helper to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to extract year from car name
const getCarYear = (name) => {
    const matchYY = name.match(/'(\d{2})$/);
    if (matchYY) {
        const y = parseInt(matchYY[1], 10);
        return y < 50 ? 2000 + y : 1900 + y;
    }
    const matchYYYY = name.match(/\b(19|20)\d{2}\b/);
    if (matchYYYY) return parseInt(matchYYYY[0], 10);
    return null;
};

const generateLaps = () => {
    const rand = Math.random();
    if (rand < 0.7) {
        return Math.floor(Math.random() * 4) + 2; // 2 to 5
    } else if (rand < 0.9) {
        return Math.floor(Math.random() * 5) + 6; // 6 to 10
    } else {
        return Math.floor(Math.random() * 11) + 10; // 10 to 20
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        generateBtn: document.getElementById('generate-btn'),
        eventsContainer: document.getElementById('events-container'),
        lengthTypeSelect: document.getElementById('length-type'),
        lengthValueInput: document.getElementById('length-value'),
        eventCountInput: document.getElementById('event-count'),
        sameCarCheckbox: document.getElementById('same-car')
    };

    elements.lengthTypeSelect.addEventListener('change', () => {
        const isRandom = elements.lengthTypeSelect.value === 'random';
        elements.lengthValueInput.style.display = isRandom ? 'none' : 'inline-block';
        if (!isRandom) {
            elements.lengthValueInput.placeholder = elements.lengthTypeSelect.value === 'laps' ? 'Laps' : 'Minutes';
            if (!elements.lengthValueInput.value) {
                elements.lengthValueInput.value = elements.lengthTypeSelect.value === 'laps' ? 5 : 15;
            }
        }
    });

    const getCheckedValues = (selector) => Array.from(document.querySelectorAll(`${selector}:checked`)).map(cb => cb.value);

    const filterData = () => {
        const catFilters = getCheckedValues('.filter-cat');
        const yearFilters = getCheckedValues('.filter-year');
        const dtFilters = getCheckedValues('.filter-dt');
        const aspFilters = getCheckedValues('.filter-asp');
        const regFilters = getCheckedValues('.filter-reg');
        const trackCatFilters = getCheckedValues('.filter-tcat');
        const trackRegFilters = getCheckedValues('.filter-treg');

        let availableCars = gt7Cars.filter(car => {
            let matchesCat = true;
            if (catFilters.length > 0) {
                const isGrB = car.name.includes('Gr.B') || car.category === 'Gr.B';
                const isRoadCar = car.category === 'Road Car' && !car.name.includes('Gr.B');
                
                matchesCat = catFilters.some(filter => {
                    if (filter === 'Gr.B') return isGrB;
                    if (filter === 'Road Car') return isRoadCar;
                    return car.category === filter;
                });
            }

            let matchesYear = true;
            // Only apply year filtering if any year filter is selected
            if (yearFilters.length > 0) {
                const year = getCarYear(car.name);
                if (year === null) {
                    matchesYear = yearFilters.includes('unknown');
                } else {
                    matchesYear = yearFilters.some(filter => {
                        if (filter === 'pre80') return year < 1980;
                        if (filter === '80s') return year >= 1980 && year < 1990;
                        if (filter === '90s') return year >= 1990 && year < 2000;
                        if (filter === '00s') return year >= 2000 && year < 2010;
                        if (filter === '10s') return year >= 2010 && year < 2020;
                        if (filter === '20s') return year >= 2020;
                        return false;
                    });
                }
            }

            return matchesCat && matchesYear &&
                   (dtFilters.length === 0 || dtFilters.includes(car.drivetrain)) &&
                   (aspFilters.length === 0 || aspFilters.includes(car.aspiration)) &&
                   (regFilters.length === 0 || regFilters.includes(car.region));
        });

        if (!availableCars.length) {
            alert('No cars match your selected filters! Ignoring car filters for this generation.');
            availableCars = gt7Cars;
        }

        let availableTracks = gt7Tracks.filter(track => 
            (trackCatFilters.length === 0 || trackCatFilters.includes(track.category)) &&
            (trackRegFilters.length === 0 || trackRegFilters.includes(track.region))
        );

        if (!availableTracks.length) {
            alert('No tracks match your selected filters! Ignoring track filters for this generation.');
            availableTracks = gt7Tracks;
        }

        return { availableCars, availableTracks };
    };

    const createEventCard = (car, track, lengthData, index, totalEvents) => {
        const timeOfDay = getRandomItem(timesOfDay);
        const weather = getRandomItem(weatherTypes);
        
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.style.animationDelay = `${index * 0.05}s`;

        const carLogoHtml = car.logo ? `<div class="brand-logo-container"><img src="logos/${car.logo}.png" class="brand-logo" alt="${car.maker} logo" onerror="this.parentElement.style.display='none'"></div>` : '';
        const trackLogoHtml = track.logo ? `<div class="track-logo-container"><img src="track_logos/${track.logo}.png" class="track-logo" alt="${track.base_name} logo" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='inline';"></div>` : '';
        const trackEmojiHtml = `<span class="track-emoji" style="${track.logo ? 'display:none;' : ''}">${track.emoji}</span>`;
        const layoutHtml = track.layout ? `<span class="layout-badge">${track.layout}</span>` : '';

        eventCard.innerHTML = `
            ${totalEvents > 1 ? `<h3>Event ${index + 1}</h3>` : ''}
            <div class="event-row">
                <div class="main-info">
                    <div class="info-box car-box">
                        <h4>Car</h4>
                        <div class="car-title-wrapper">
                            ${carLogoHtml}
                            <p>${car.name}</p>
                        </div>
                        <div class="car-badges">
                            <span class="spec-badge category-badge">${car.category}</span>
                            <span class="spec-badge dt-badge">${car.drivetrain}</span>
                            <span class="spec-badge asp-badge">${car.aspiration}</span>
                            <span class="region-badge ${car.region.toLowerCase().replace('-', '')}">${car.region}</span>
                        </div>
                    </div>
                    <div class="info-box track-box">
                        <h4>Track</h4>
                        <div class="track-title-wrapper">
                            ${trackLogoHtml}
                            ${trackEmojiHtml}
                            <div>
                                <p class="track-base-name">${track.base_name}</p>
                                ${layoutHtml}
                            </div>
                        </div>
                        <div class="track-badges">
                            <span class="region-badge ${track.region.toLowerCase().replace('-', '')}">${track.region}</span>
                        </div>
                    </div>
                </div>
                <div class="sub-info">
                    <div class="info-box">
                        <h4>${lengthData.label}</h4>
                        <p>${lengthData.value}</p>
                    </div>
                    <div class="info-box">
                        <h4>Time</h4>
                        <p>${timeOfDay}</p>
                    </div>
                    <div class="info-box">
                        <h4>Weather</h4>
                        <p>${weather}</p>
                    </div>
                </div>
            </div>
        `;
        return eventCard;
    };

    elements.generateBtn.addEventListener('click', () => {
        let numEvents = Math.max(1, Math.min(100, parseInt(elements.eventCountInput.value, 10) || 1));
        elements.eventCountInput.value = numEvents;

        const { availableCars, availableTracks } = filterData();
        const globalCar = elements.sameCarCheckbox.checked ? getRandomItem(availableCars) : null;
        
        const lengthType = elements.lengthTypeSelect.value;
        const customLengthValue = Math.max(1, parseInt(elements.lengthValueInput.value, 10) || 1);

        // Group tracks by base_name to ensure equal probability for each location
        const trackGroups = {};
        for (const track of availableTracks) {
            if (!trackGroups[track.base_name]) {
                trackGroups[track.base_name] = [];
            }
            trackGroups[track.base_name].push(track);
        }
        
        let availableBaseNames = Object.keys(trackGroups);
        
        const getUniqueRandomTrack = () => {
            if (availableBaseNames.length === 0) {
                // Reset pool if we somehow run out of unique locations (e.g. strict filters)
                availableBaseNames = Object.keys(trackGroups);
                if (availableBaseNames.length === 0) return getRandomItem(availableTracks);
            }
            const randIndex = Math.floor(Math.random() * availableBaseNames.length);
            const baseName = availableBaseNames[randIndex];
            
            // Remove the baseName from pool to prevent same track location repeating
            availableBaseNames.splice(randIndex, 1);
            
            const layouts = trackGroups[baseName];
            return getRandomItem(layouts);
        };

        let availableCarPool = [...availableCars];
        
        const getUniqueRandomCar = () => {
            if (availableCarPool.length === 0) {
                availableCarPool = [...availableCars];
                if (availableCarPool.length === 0) return getRandomItem(availableCars);
            }
            const randIndex = Math.floor(Math.random() * availableCarPool.length);
            const car = availableCarPool[randIndex];
            availableCarPool.splice(randIndex, 1);
            return car;
        };

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < numEvents; i++) {
            const lengthData = {
                label: lengthType === 'time' ? 'Time Limit' : 'Laps',
                value: lengthType === 'random' ? generateLaps() : (lengthType === 'time' ? `${customLengthValue} Min` : customLengthValue)
            };

            const car = globalCar || getUniqueRandomCar();
            const track = getUniqueRandomTrack();

            fragment.appendChild(createEventCard(car, track, lengthData, i, numEvents));
        }

        elements.eventsContainer.replaceChildren(fragment);
    });
    
    // Generate initially
    elements.generateBtn.click();
});