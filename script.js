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
        const dtFilters = getCheckedValues('.filter-dt');
        const aspFilters = getCheckedValues('.filter-asp');
        const regFilters = getCheckedValues('.filter-reg');
        const trackCatFilters = getCheckedValues('.filter-tcat');
        const trackRegFilters = getCheckedValues('.filter-treg');

        let availableCars = gt7Cars.filter(car => {
            let matchesCat = true;
            if (catFilters.length > 0) {
                if (catFilters.includes('N100') && ['N100', 'N200', 'N300', 'N400'].includes(car.category)) matchesCat = true;
                else if (catFilters.includes('N500') && ['N500', 'N600', 'N700', 'N800', 'N900', 'N1000'].includes(car.category)) matchesCat = true;
                else matchesCat = catFilters.includes(car.category);
            }
            return matchesCat &&
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

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < numEvents; i++) {
            const lengthData = {
                label: lengthType === 'time' ? 'Time Limit' : 'Laps',
                value: lengthType === 'random' ? generateLaps() : (lengthType === 'time' ? `${customLengthValue} Min` : customLengthValue)
            };

            const car = globalCar || getRandomItem(availableCars);
            const track = getRandomItem(availableTracks);

            fragment.appendChild(createEventCard(car, track, lengthData, i, numEvents));
        }

        elements.eventsContainer.replaceChildren(fragment);
    });
    
    // Generate initially
    elements.generateBtn.click();
});