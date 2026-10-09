/* ==========================================================================
   IKIGAJ TATTOO STUDIO - Główny Skrypt Strony Pokazowej
   Nowy Sącz, ul. Lwowska 30/1
   ========================================================================== */

const CONFIG = {
    BRAND_NAME: "IKIGAJ TATTOO",
    STUDIO_LOCATION: "Lwowska 30/1, 33-300 Nowy Sącz",
    INSTAGRAM_URL: "https://www.instagram.com/ikigaj_tattoo/",
    HOURS_WEEKDAYS: "Pn – Pt: 10:00 – 18:00",
    HOURS_SATURDAY: "Sobota: 10:00 – 14:00",
    HOURS_SUNDAY: "Niedziela: ZAMKNIĘTE",
    LOCAL_STORAGE_KEY: "ikigaj_bookings",
    LOCAL_STORAGE_HISTORY_KEY: "ikigaj_bookings_history",
    DEMO_ADMIN_EMAIL: "admin@ikigaj.pl",
    DEMO_ADMIN_PASS: "admin123"
};

/* === STAN APLIKACJI I KALENDARZA === */
const todayDate = new Date();
const currentRealYear = todayDate.getFullYear();
const currentRealMonth = todayDate.getMonth(); // 0-11
const currentRealDay = todayDate.getDate();

let calendarYear = currentRealYear;
let calendarMonth = currentRealMonth;

let bookingState = {
    step: 1,
    selectedServiceKey: 'realism',
    selectedServiceName: 'Realism & Rzeźba',
    selectedDate: null,
    selectedTime: null
};

let uploadedInspirationFiles = [];

const servicesData = {
    'realism': { 
        name: 'Realism & Rzeźba', 
        desc: 'Marmurowe popiersia antyczne, bóstwa grecko-rzymskie, fotorealizm i mistrzowska gra światłocienia' 
    },
    'blackwork': { 
        name: 'Blackwork & Dark', 
        desc: 'Głęboka, nasycona czerń, mroczna mitologia, symbole, kompozycje na plecy i ramiona' 
    },
    'dotwork': { 
        name: 'Dotwork & Geometria', 
        desc: 'Precyzyjne cieniowanie punktowe, mandale, motyle ze strukturą czaszki, motywy sakralne' 
    },
    'konsultacja': { 
        name: 'Konsultacja & Projekt', 
        desc: 'Indywidualne omówienie kompozycji, dobór anatomii i stworzenie autorskiego projektu w studiu' 
    }
};

// Godziny pracy studia zależne od dnia tygodnia:
// Pn-Pt (1-5): 10:00 - 18:00
// Sobota (6): 10:00 - 14:00
// Niedziela (0): Zamknięte
function getTimeSlotsForDate(dateStr) {
    if (!dateStr) return ['10:00', '12:00', '14:00', '16:00'];
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) {
        return []; // Niedziela zamknięte
    }
    if (dayOfWeek === 6) {
        // Sobota: 10:00 - 14:00
        return ['10:00', '11:30', '13:00'];
    }
    // Dni robocze: 10:00 - 18:00
    return ['10:00', '11:30', '13:00', '14:30', '16:00', '17:00'];
}

/* === INICJALIZACJA DANYCH DEMO W LOCALSTORAGE === */
function getRelativeDateStr(daysOffset, skipSunday = true) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    if (skipSunday && d.getDay() === 0) {
        d.setDate(d.getDate() + 1);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function ensureInitialDemoData() {
    let active = [];
    try {
        active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    } catch (e) {
        active = [];
    }

    if (!Array.isArray(active) || active.length === 0) {
        const datePartial1 = getRelativeDateStr(2);
        const dateFull = getRelativeDateStr(4);
        const datePartial2 = getRelativeDateStr(6);

        // Generujemy pełne zajęcie dla dateFull
        const fullSlots = getTimeSlotsForDate(dateFull);
        const fullBookings = fullSlots.map((time, idx) => ({
            id: `IK-78${idx}10`,
            createdAt: new Date(Date.now() - 3600000 * (10 + idx)).toISOString(),
            serviceKey: idx % 2 === 0 ? 'realism' : 'blackwork',
            serviceName: idx % 2 === 0 ? 'Realism & Rzeźba' : 'Blackwork & Dark',
            placement: 'Ramię / Przedramię',
            approxSize: '15x10 cm',
            ideaDesc: 'Rezerwacja sesji całodziennej / projekt indywidualny.',
            date: dateFull,
            time: time,
            client: {
                firstName: ['Damian', 'Marek', 'Tomasz', 'Mateusz', 'Kamil', 'Jakub'][idx] || 'Klient',
                lastName: 'Zajęty',
                email: `klient${idx}@example.com`,
                phone: `+48 501 000 00${idx}`
            },
            photos: [],
            status: 'confirmed'
        }));

        const demoActive = [
            {
                id: 'IK-782194',
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
                serviceKey: 'realism',
                serviceName: 'Realism & Rzeźba',
                placement: 'Prawe przedramię',
                approxSize: '18x10 cm',
                ideaDesc: 'Marmurowe popiersie Zeusa z liśćmi laurowymi w ciemnym dymnym tle, styl rzeźby greckiej.',
                date: datePartial1,
                time: '11:30',
                client: {
                    firstName: 'Michał',
                    lastName: 'Kowalczyk',
                    email: 'michal.kowalczyk@example.com',
                    phone: '+48 601 234 567'
                },
                photos: [
                    { name: 'zeus-inspiracja.png', dataUrl: 'portfolio-1.png', size: '240 KB' }
                ],
                status: 'pending'
            },
            {
                id: 'IK-782195',
                createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
                serviceKey: 'dotwork',
                serviceName: 'Dotwork & Geometria',
                placement: 'Łydka',
                approxSize: '12x8 cm',
                ideaDesc: 'Motyl z motywem czaszki i geometryczne kropkowanie.',
                date: datePartial1,
                time: '14:30',
                client: {
                    firstName: 'Piotr',
                    lastName: 'Zieliński',
                    email: 'piotr.zielinski@example.com',
                    phone: '+48 603 555 777'
                },
                photos: [
                    { name: 'motyl-czaszka.png', dataUrl: 'portfolio-4.png', size: '180 KB' }
                ],
                status: 'confirmed'
            },
            ...fullBookings,
            {
                id: 'IK-941203',
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                serviceKey: 'blackwork',
                serviceName: 'Blackwork & Dark',
                placement: 'Górna część pleców',
                approxSize: 'Duży motyw na całe łopatki',
                ideaDesc: 'Posąg sprawiedliwości Temida, pęknięcia marmuru i wieniec laurowy Liberum Anima.',
                date: datePartial2,
                time: '13:00',
                client: {
                    firstName: 'Kacper',
                    lastName: 'Nowak',
                    email: 'kacper.nowak@example.com',
                    phone: '+48 502 987 654'
                },
                photos: [
                    { name: 'plecy-kompozycja.png', dataUrl: 'portfolio-3.png', size: '320 KB' }
                ],
                status: 'confirmed'
            }
        ];
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(demoActive));
    }

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        history = [];
    }

    if (!Array.isArray(history) || history.length === 0) {
        const demoHistory = [
            {
                id: 'IK-512930',
                createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
                serviceKey: 'dotwork',
                serviceName: 'Dotwork & Geometria',
                placement: 'Przedramię',
                approxSize: '12x8 cm',
                ideaDesc: 'Motyl ze strukturą czaszki w technice delikatnego dotworku i mocnego kontrastu.',
                date: getRelativeDateStr(-3),
                time: '14:30',
                client: {
                    firstName: 'Sylwia',
                    lastName: 'Kachniarz',
                    email: 'sylwia.kachniarz@example.com',
                    phone: '+48 693 111 222'
                },
                photos: [
                    { name: 'motyl-czaszka.png', dataUrl: 'portfolio-4.png', size: '180 KB' }
                ],
                status: 'completed'
            }
        ];
        localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(demoHistory));
    }
}


/* === INTERAKTYWNY KREATOR REZERWACJI (WIZARD 4 KROKI) === */
function selectBookingService(serviceKey) {
    if (!servicesData[serviceKey]) return;
    bookingState.selectedServiceKey = serviceKey;
    bookingState.selectedServiceName = servicesData[serviceKey].name;

    const cards = document.querySelectorAll('.service-select-card');
    cards.forEach(c => {
        c.classList.remove('active');
        const icon = c.querySelector('.service-check-icon');
        if (icon) {
            icon.className = 'fa-regular fa-circle text-slate-600 service-check-icon';
        }
    });

    const activeCard = Array.from(cards).find(c => {
        const h4 = c.querySelector('h4');
        return h4 && h4.innerText.includes(servicesData[serviceKey].name.split('&')[0].trim());
    });

    if (activeCard) {
        activeCard.classList.add('active');
        const icon = activeCard.querySelector('.service-check-icon');
        if (icon) {
            icon.className = 'fa-solid fa-circle-check text-white service-check-icon';
        }
    }
}

function goToWizardStep(stepNumber) {
    if (stepNumber === 2) {
        const placement = document.getElementById('booking-body-placement');
        const idea = document.getElementById('booking-idea-desc');
        if (!placement || !placement.value.trim()) {
            showCustomModal("Wymagane pole", "Wpisz orientacyjne miejsce na ciele dla tatuażu (np. przedramię, łydka, ramię).", "warning");
            if (placement) placement.focus();
            return;
        }
        if (!idea || !idea.value.trim()) {
            showCustomModal("Wymagane pole", "Opisz krótko swój pomysł lub motyw, abyśmy mogli przygotować projekt.", "warning");
            if (idea) idea.focus();
            return;
        }
    }

    if (stepNumber === 3) {
        if (!bookingState.selectedDate || !bookingState.selectedTime) {
            showCustomModal("Wybór terminu", "Zaznacz dostępny dzień w kalendarzu oraz wybierz dogodną godzinę sesji.", "info");
            return;
        }
    }

    if (stepNumber === 4) {
        const fn = document.getElementById('client-first-name');
        const ln = document.getElementById('client-last-name');
        const em = document.getElementById('client-email');
        const ph = document.getElementById('client-phone');
        const rodo = document.getElementById('client-consent-rodo');

        if (!fn || !fn.value.trim() || !ln || !ln.value.trim()) {
            showCustomModal("Uzupełnij dane", "Wpisz imię i nazwisko osoby rezerwującej sesję.", "warning");
            return;
        }
        if (!em || !em.value.trim() || !em.value.includes('@') || !em.value.includes('.')) {
            showCustomModal("Błędny e-mail", "Podaj poprawny adres e-mail do przesłania potwierdzenia.", "warning");
            if (em) em.focus();
            return;
        }
        if (!ph || !ph.value.trim() || ph.value.trim().length < 6) {
            showCustomModal("Błędny telefon", "Podaj poprawny numer telefonu do kontaktu w dniu wizyty.", "warning");
            if (ph) ph.focus();
            return;
        }
        if (!rodo || !rodo.checked) {
            showCustomModal("Akceptacja regulaminu", "Zaznacz zgodę na regulamin i przetwarzanie danych w celu realizacji rezerwacji.", "warning");
            return;
        }

        updateWizardSummary();
    }

    bookingState.step = stepNumber;

    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`wizard-step-${i}`);
        if (stepEl) stepEl.classList.toggle('hidden', stepNumber !== i);
    }

    // Aktualizacja kropek i paska postępu
    const progressLine = document.getElementById('wizard-progress-line');
    if (progressLine) {
        const pct = ((stepNumber - 1) / 3) * 100;
        progressLine.style.width = `${pct}%`;
    }

    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (!dot) continue;
        if (i < stepNumber) {
            dot.className = 'w-10 h-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-sm shadow-lg transition';
            dot.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
        } else if (i === stepNumber) {
            dot.className = 'w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center text-sm shadow-xl transition scale-110';
            dot.innerText = i;
        } else {
            dot.className = 'w-10 h-10 rounded-full bg-[#181a20] border border-white/20 text-slate-400 font-bold flex items-center justify-center text-sm transition';
            dot.innerText = i;
        }
    }

    const wizardSection = document.getElementById('rezerwacja');
    if (wizardSection) {
        wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateWizardSummary() {
    const sService = document.getElementById('summary-service');
    const sDateTime = document.getElementById('summary-date-time');
    const sPlacement = document.getElementById('summary-placement');
    const sClient = document.getElementById('summary-client-name');
    const sContact = document.getElementById('summary-client-contact');
    const sDesc = document.getElementById('summary-idea-desc');
    const sPhotos = document.getElementById('summary-photos-count');

    const fn = (document.getElementById('client-first-name') || {}).value || '';
    const ln = (document.getElementById('client-last-name') || {}).value || '';
    const em = (document.getElementById('client-email') || {}).value || '';
    const dial = (document.getElementById('selected-country-code') || {}).innerText || '+48';
    const ph = (document.getElementById('client-phone') || {}).value || '';
    const placement = (document.getElementById('booking-body-placement') || {}).value || '';
    const size = (document.getElementById('booking-approx-size') || {}).value || '';
    const idea = (document.getElementById('booking-idea-desc') || {}).value || '';

    if (sService) sService.innerText = bookingState.selectedServiceName;
    if (sDateTime) sDateTime.innerText = `${bookingState.selectedDate} o godz. ${bookingState.selectedTime}`;
    if (sPlacement) sPlacement.innerText = size ? `${placement} (${size})` : placement;
    if (sClient) sClient.innerText = `${fn} ${ln}`;
    if (sContact) sContact.innerText = `${dial} ${ph} • ${em}`;
    if (sDesc) sDesc.innerText = idea;
    if (sPhotos) {
        sPhotos.innerText = uploadedInspirationFiles.length > 0 
            ? `Załączono ${uploadedInspirationFiles.length} zdjęcie/zdjęcia referencyjne (zoptymalizowane).` 
            : 'Brak załączonych grafik referencyjnych.';
    }
}

/* === KOMPRESJA ZDJĘĆ W CANVASA API PRZED ZAPISEM DO LOCALSTORAGE === */
function compressImageToDataUrl(file, maxWidth = 900, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = Math.round((h * maxWidth) / w);
                    w = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadedInspirationFiles.length + files.length > 5) {
        showCustomModal("Limit plików", "Możesz dodać maksymalnie 5 zdjęć referencyjnych.", "info");
        return;
    }

    for (const file of files) {
        try {
            const compressed = await compressImageToDataUrl(file);
            uploadedInspirationFiles.push({
                name: file.name,
                dataUrl: compressed,
                size: Math.round(compressed.length / 1024) + ' KB'
            });
        } catch (err) {
            console.error("Błąd kompresji grafiki:", err);
        }
    }

    renderUploadedPhotos();
}

function removeUploadedPhoto(index) {
    uploadedInspirationFiles.splice(index, 1);
    renderUploadedPhotos();
}

function renderUploadedPhotos() {
    const previewContainer = document.getElementById('uploaded-photos-preview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    uploadedInspirationFiles.forEach((fileObj, idx) => {
        const item = document.createElement('div');
        item.className = 'relative rounded-xl overflow-hidden border border-white/20 bg-black/60 group aspect-square';
        item.innerHTML = `
            <img src="${fileObj.dataUrl}" alt="${fileObj.name}" class="w-full h-full object-cover">
            <button type="button" onclick="removeUploadedPhoto(${idx})" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition" title="Usuń plik">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <span class="absolute bottom-1 left-1 right-1 text-[9px] bg-black/70 px-1 py-0.5 rounded text-white truncate text-center">${fileObj.name}</span>
        `;
        previewContainer.appendChild(item);
    });
}

/* === OBSŁUGA KALENDARZA DLA IKIGAJ TATTOO === */
const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

/* === DOSTĘPNOŚĆ TERMINÓW & KALENDARZ DLA IKIGAJ TATTOO === */
function getBookedSlotsForDate(dateStr) {
    if (!dateStr) return [];
    let active = [];
    let history = [];
    try {
        active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        active = [];
        history = [];
    }

    const booked = [];

    active.forEach(b => {
        if (b.date === dateStr && b.status !== 'cancelled' && b.time) {
            booked.push(b.time);
        }
    });

    history.forEach(b => {
        if (b.date === dateStr && b.status === 'confirmed' && b.time) {
            booked.push(b.time);
        }
    });

    return booked;
}

function getDayAvailability(dateStr) {
    const slots = getTimeSlotsForDate(dateStr);
    if (!slots || slots.length === 0) return 'full';
    const booked = getBookedSlotsForDate(dateStr);
    if (booked.length >= slots.length) return 'full';
    if (booked.length > 0) return 'partial';
    return 'free';
}

function changeCalendarMonth(delta) {
    calendarMonth += delta;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    } else if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendar();
}

function renderCalendar() {
    const monthYearEl = document.getElementById('current-month-year');
    const daysGrid = document.getElementById('calendar-days-grid');
    if (!monthYearEl || !daysGrid) return;

    monthYearEl.innerText = `${monthNames[calendarMonth]} ${calendarYear}`;
    daysGrid.innerHTML = '';

    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Przekształcamy na format Europejski: 0=Pn ... 6=Nd
    const startingBlankDays = (firstDayIndex + 6) % 7;

    for (let i = 0; i < startingBlankDays; i++) {
        const blank = document.createElement('div');
        blank.className = 'h-11 sm:h-12';
        daysGrid.appendChild(blank);
    }

    const todayStr = `${currentRealYear}-${String(currentRealMonth + 1).padStart(2, '0')}-${String(currentRealDay).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'calendar-day-btn h-11 sm:h-12 flex flex-col items-center justify-center font-mono text-xs sm:text-sm font-semibold relative';
        dayBtn.innerText = d;

        const loopDate = new Date(calendarYear, calendarMonth, d);
        const dayOfWeek = loopDate.getDay();
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const isPast = (dateStr < todayStr);
        const isSunday = (dayOfWeek === 0);

        if (isPast || isSunday) {
            dayBtn.disabled = true;
            if (isSunday) {
                dayBtn.title = "Niedziela: ZAMKNIĘTE";
                dayBtn.classList.add('text-rose-500/40', 'opacity-30', 'cursor-not-allowed');
            } else {
                dayBtn.title = "Termin miniony";
                dayBtn.classList.add('text-slate-600', 'opacity-25', 'cursor-not-allowed');
            }
        } else {
            const avail = getDayAvailability(dateStr);
            dayBtn.classList.add(`cal-day-${avail}`);

            // Kropka wskaźnika dostępności
            const dot = document.createElement('span');
            dot.className = `cal-dot cal-dot-${avail}`;
            dayBtn.appendChild(dot);

            if (dateStr === todayStr) {
                dayBtn.classList.add('today');
            }

            if (bookingState.selectedDate === dateStr) {
                dayBtn.classList.add('selected');
            }

            if (avail === 'full') {
                dayBtn.title = "Brak wolnych godzin w tym dniu";
            } else if (avail === 'partial') {
                dayBtn.title = "Ostatnie wolne miejsca!";
            } else {
                dayBtn.title = "Wolne terminy";
            }

            dayBtn.onclick = () => selectCalendarDay(dateStr);
        }

        daysGrid.appendChild(dayBtn);
    }
}

function selectCalendarDay(dateStr) {
    bookingState.selectedDate = dateStr;
    bookingState.selectedTime = null; // reset wybranej godziny

    const label = document.getElementById('selected-day-display');
    if (label) {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        label.innerText = `${dayNames[d.getDay()]}, ${parts[2]} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`;
    }

    renderCalendar();
    renderTimeSlots(dateStr);
}

function renderTimeSlots(dateStr) {
    const container = document.getElementById('time-slots-container');
    if (!container) return;

    container.innerHTML = '';

    if (!dateStr) {
        container.innerHTML = '<div class="col-span-2 text-center text-xs text-slate-500 py-6 italic">Wybierz najpierw dzień w kalendarzu.</div>';
        return;
    }

    const slots = getTimeSlotsForDate(dateStr);
    if (!slots || slots.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-center text-xs text-rose-400 py-6 font-medium">Brak dostępnych godzin dla tego dnia (studio zamknięte).</div>';
        return;
    }

    const bookedSlots = getBookedSlotsForDate(dateStr);

    slots.forEach(time => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isBooked = bookedSlots.includes(time);
        const isSelected = (bookingState.selectedTime === time);

        if (isBooked) {
            btn.disabled = true;
            btn.className = 'p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-slate-500 text-xs sm:text-sm font-mono font-bold cursor-not-allowed opacity-50 flex items-center justify-between line-through select-none';
            btn.innerHTML = `
                <span>${time}</span>
                <span class="text-[10px] uppercase font-bold text-rose-400 no-underline bg-rose-500/20 px-2 py-0.5 rounded">Zajęty</span>
            `;
        } else {
            let cls = 'time-slot-btn p-3.5 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider flex items-center justify-between transition cursor-pointer ';
            if (isSelected) {
                cls += 'selected';
            } else {
                cls += 'border-white/10 hover:border-white/30 bg-white/5 text-white hover:bg-white/10';
            }
            btn.className = cls;
            btn.innerHTML = `
                <span>${time}</span>
                <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Wolny</span>
            `;
            btn.onclick = () => {
                bookingState.selectedTime = time;
                renderTimeSlots(dateStr);
            };
        }

        container.appendChild(btn);
    });
}

/* === OBSŁUGA WYSYŁANIA REZERWACJI === */
function handleBookingSubmit(e) {
    if (e) e.preventDefault();

    const fn = (document.getElementById('client-first-name') || {}).value.trim();
    const ln = (document.getElementById('client-last-name') || {}).value.trim();
    const em = (document.getElementById('client-email') || {}).value.trim();
    const dial = (document.getElementById('selected-country-code') || {}).innerText || '+48';
    const ph = (document.getElementById('client-phone') || {}).value.trim();
    const placement = (document.getElementById('booking-body-placement') || {}).value.trim();
    const size = (document.getElementById('booking-approx-size') || {}).value.trim();
    const idea = (document.getElementById('booking-idea-desc') || {}).value.trim();

    const randomId = 'IK-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
        id: randomId,
        createdAt: new Date().toISOString(),
        serviceKey: bookingState.selectedServiceKey,
        serviceName: bookingState.selectedServiceName,
        placement: placement,
        approxSize: size,
        ideaDesc: idea,
        date: bookingState.selectedDate,
        time: bookingState.selectedTime,
        client: {
            firstName: fn,
            lastName: ln,
            email: em,
            phone: `${dial} ${ph}`
        },
        photos: [...uploadedInspirationFiles],
        status: 'pending'
    };

    let active = [];
    try {
        active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    } catch (err) {
        active = [];
    }
    active.unshift(newBooking);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(active));

    showSuccessModal(newBooking);
    resetBookingForm();
}

function resetBookingForm() {
    bookingState = {
        step: 1,
        selectedServiceKey: 'realism',
        selectedServiceName: 'Realism & Rzeźba',
        selectedDate: null,
        selectedTime: null
    };
    uploadedInspirationFiles = [];
    renderUploadedPhotos();

    const form = document.getElementById('main-booking-form');
    if (form) form.reset();

    selectBookingService('realism');
    goToWizardStep(1);
    renderCalendar();
}

function showSuccessModal(booking) {
    const content = `
        <div class="text-center py-4">
            <div class="w-16 h-16 rounded-2xl bg-white text-black text-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
                <i class="fa-solid fa-check"></i>
            </div>
            <h3 class="font-cinzel text-2xl sm:text-3xl font-black text-white mb-2">Rezerwacja Zapisana!</h3>
            <p class="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mb-6">
                Dziękujemy, <strong>${booking.client.firstName}</strong>. Twoje zgłoszenie trafiło bezpośrednio do naszego systemu w studiu IKIGAJ TATTOO.
            </p>
            <div class="bg-black/60 border border-white/10 rounded-2xl p-4 text-left text-xs sm:text-sm space-y-2 mb-6 font-mono">
                <div class="flex justify-between"><span class="text-slate-400">Kod wizyty:</span> <strong class="text-white">${booking.id}</strong></div>
                <div class="flex justify-between"><span class="text-slate-400">Termin:</span> <strong class="text-white">${booking.date} o ${booking.time}</strong></div>
                <div class="flex justify-between"><span class="text-slate-400">Styl:</span> <strong class="text-white">${booking.serviceName}</strong></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
                <button onclick="closeCustomModal()" class="w-full bg-white text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition">
                    Zamknij okno
                </button>
                <button onclick="closeCustomModal(); navigateToAdmin();" class="w-full bg-white/10 text-white border border-white/15 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition">
                    Zobacz w Panelu Admina
                </button>
            </div>
        </div>
    `;
    const modalBackdrop = document.getElementById('custom-modal-backdrop');
    const modalBox = document.getElementById('custom-modal-box');
    const modalContent = document.getElementById('custom-modal-content');
    if (modalBackdrop && modalBox && modalContent) {
        modalContent.innerHTML = content;
        modalBackdrop.classList.remove('hidden');
        setTimeout(() => {
            modalBox.classList.remove('scale-95', 'opacity-0');
            modalBox.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
}

/* === DROPDOWN PREFIKSU KRAJU === */
function toggleCountryDropdown(forceState) {
    const menu = document.getElementById('country-dropdown-menu');
    if (!menu) return;
    if (typeof forceState === 'boolean') {
        menu.classList.toggle('hidden', !forceState);
    } else {
        menu.classList.toggle('hidden');
    }
}

function selectCountryCode(code, flag) {
    const cCode = document.getElementById('selected-country-code');
    const cFlag = document.getElementById('selected-country-flag');
    if (cCode) cCode.innerText = code;
    if (cFlag) cFlag.innerText = flag;
    toggleCountryDropdown(false);
}

/* === PANEL ADMINISTRATORA (#admin) === */
function checkAdminRoute() {
    const hash = window.location.hash;
    const mainView = document.getElementById('main-content-view');
    const adminView = document.getElementById('admin-view-container');
    if (!mainView || !adminView) return;

    if (hash === '#admin') {
        mainView.classList.add('hidden');
        adminView.classList.remove('hidden');
        window.scrollTo(0, 0);

        const isLogged = sessionStorage.getItem('ikigaj_admin_logged') === 'true';
        const loginScreen = document.getElementById('admin-login-screen');
        const dashboard = document.getElementById('admin-dashboard');

        if (isLogged) {
            if (loginScreen) loginScreen.classList.add('hidden');
            if (dashboard) dashboard.classList.remove('hidden');
            renderAdminDashboard();
        } else {
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (dashboard) dashboard.classList.add('hidden');
        }
    } else {
        mainView.classList.remove('hidden');
        adminView.classList.add('hidden');
    }
}

function handleAdminLogin(e) {
    if (e) e.preventDefault();
    const email = (document.getElementById('admin-input-email') || {}).value.trim();
    const pass = (document.getElementById('admin-input-password') || {}).value.trim();
    const errBox = document.getElementById('admin-login-error');

    if (email === CONFIG.DEMO_ADMIN_EMAIL && pass === CONFIG.DEMO_ADMIN_PASS) {
        sessionStorage.setItem('ikigaj_admin_logged', 'true');
        if (errBox) errBox.classList.add('hidden');
        checkAdminRoute();
    } else {
        if (errBox) {
            errBox.innerText = 'Nieprawidłowe dane. Użyj demo: admin@ikigaj.pl / admin123';
            errBox.classList.remove('hidden');
        }
    }
}

function exitAdminView() {
    window.location.hash = '';
    checkAdminRoute();
}

function renderAdminDashboard() {
    let active = [];
    let history = [];
    try {
        active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
        history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        active = [];
        history = [];
    }

    const statActive = document.getElementById('admin-stat-active');
    const statPending = document.getElementById('admin-stat-pending');
    const statCompleted = document.getElementById('admin-stat-completed');

    if (statActive) statActive.innerText = active.length;
    if (statPending) statPending.innerText = active.filter(b => b.status === 'pending').length;
    if (statCompleted) statCompleted.innerText = history.filter(b => b.status === 'completed').length;

    renderActiveBookingsTable(active);
    renderHistoryBookingsTable(history);
}

function renderActiveBookingsTable(bookings) {
    const tbody = document.getElementById('admin-active-bookings-tbody');
    if (!tbody) return;

    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-500 font-light">Brak aktywnych rezerwacji. Wszystkie zgłoszenia zostały zrealizowane.</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map((b) => {
        const statusBadge = b.status === 'confirmed'
            ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Potwierdzona</span>'
            : '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">Oczekująca</span>';

        // Miniatury zdjęć
        let photosHtml = '';
        if (b.photos && b.photos.length > 0) {
            photosHtml = `
                <div class="flex items-center gap-1.5 mt-2">
                    ${b.photos.map((p, pIdx) => `
                        <button type="button" onclick="previewAdminPhoto('${b.id}', ${pIdx})" class="w-8 h-8 rounded-lg overflow-hidden border border-white/20 hover:border-white transition flex-shrink-0" title="Kliknij, aby powiększyć zdjęcie">
                            <img src="${p.dataUrl}" alt="${p.name}" class="w-full h-full object-cover">
                        </button>
                    `).join('')}
                    <span class="text-[10px] text-slate-400">(${b.photos.length} ref.)</span>
                </div>
            `;
        }

        return `
            <tr class="hover:bg-white/[0.02] transition">
                <td class="py-4 px-4 sm:px-6">
                    <strong class="font-mono text-white text-xs block">${b.id}</strong>
                    <span class="text-slate-400 text-xs">${b.date} • <strong>${b.time}</strong></span>
                </td>
                <td class="py-4 px-4 sm:px-6">
                    <strong class="text-white block">${b.client.firstName} ${b.client.lastName}</strong>
                    <span class="text-slate-400 text-xs block font-mono">${b.client.phone}</span>
                    <span class="text-slate-500 text-[11px] block">${b.client.email}</span>
                </td>
                <td class="py-4 px-4 sm:px-6 max-w-xs">
                    <span class="font-cinzel text-white block text-xs">${b.serviceName}</span>
                    <span class="text-slate-400 text-xs block">${b.placement}${b.approxSize ? ` (${b.approxSize})` : ''}</span>
                    <p class="text-slate-400 text-[11px] italic truncate mt-0.5" title="${b.ideaDesc}">${b.ideaDesc}</p>
                    ${photosHtml}
                </td>
                <td class="py-4 px-4 sm:px-6">
                    ${statusBadge}
                </td>
                <td class="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                    ${b.status !== 'confirmed' ? `
                        <button onclick="setBookingStatus('${b.id}', 'confirmed')" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition" title="Potwierdź wizytę">
                            <i class="fa-solid fa-check mr-1"></i> Potwierdź
                        </button>
                    ` : ''}
                    <button onclick="setBookingStatus('${b.id}', 'completed')" class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition" title="Oznacz jako zrealizowaną">
                        <i class="fa-solid fa-flag-checkered mr-1"></i> Zrealizowano
                    </button>
                    <button onclick="setBookingStatus('${b.id}', 'cancelled')" class="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition" title="Anuluj wizytę">
                        <i class="fa-solid fa-ban mr-1"></i> Anuluj
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderHistoryBookingsTable(history) {
    const tbody = document.getElementById('admin-history-bookings-tbody');
    if (!tbody) return;

    if (!history || history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-500 font-light">Brak archiwalnych wizyt.</td></tr>';
        return;
    }

    tbody.innerHTML = history.map((b) => {
        const badge = b.status === 'completed'
            ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Zrealizowano</span>'
            : '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400">Anulowano</span>';

        return `
            <tr class="hover:bg-white/[0.02] transition opacity-75">
                <td class="py-4 px-4 sm:px-6">
                    <strong class="font-mono text-white text-xs block">${b.id}</strong>
                    <span class="text-slate-400 text-xs">${b.date} • ${b.time}</span>
                </td>
                <td class="py-4 px-4 sm:px-6">
                    <strong class="text-white block">${b.client.firstName} ${b.client.lastName}</strong>
                    <span class="text-slate-400 text-xs block font-mono">${b.client.phone}</span>
                </td>
                <td class="py-4 px-4 sm:px-6">
                    <span class="text-white text-xs block">${b.serviceName}</span>
                    <span class="text-slate-400 text-xs">${b.placement}</span>
                </td>
                <td class="py-4 px-4 sm:px-6">
                    ${badge}
                </td>
                <td class="py-4 px-4 sm:px-6 text-right">
                    <button onclick="deleteHistoryBooking('${b.id}')" class="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded hover:bg-rose-500/10 transition" title="Usuń z historii">
                        <i class="fa-solid fa-trash-can mr-1"></i> Usuń
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function setBookingStatus(bookingId, newStatus) {
    let active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    let history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');

    const idx = active.findIndex(b => b.id === bookingId);
    if (idx === -1) return;

    if (newStatus === 'confirmed') {
        active[idx].status = 'confirmed';
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(active));
    } else if (newStatus === 'completed' || newStatus === 'cancelled') {
        const item = active.splice(idx, 1)[0];
        item.status = newStatus;
        item.archivedAt = new Date().toISOString();
        history.unshift(item);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(active));
        localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    }

    renderAdminDashboard();
}

function deleteHistoryBooking(bookingId) {
    let history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    history = history.filter(b => b.id !== bookingId);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    renderAdminDashboard();
}

/* === PODGLĄD ZDJĘĆ INSPIRACJI W PANELU ADMINA === */
function previewAdminPhoto(bookingId, photoIndex) {
    let active = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    let history = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    const all = [...active, ...history];
    const booking = all.find(b => b.id === bookingId);
    if (!booking || !booking.photos || !booking.photos[photoIndex]) return;

    const photo = booking.photos[photoIndex];
    const modal = document.getElementById('admin-photo-modal');
    const imgEl = document.getElementById('admin-photo-modal-img');
    const clientEl = document.getElementById('admin-photo-modal-client');
    const serviceEl = document.getElementById('admin-photo-modal-service');
    const descEl = document.getElementById('admin-photo-modal-desc');

    if (imgEl) imgEl.src = photo.dataUrl;
    if (clientEl) clientEl.innerText = `${booking.client.firstName} ${booking.client.lastName} (${booking.id})`;
    if (serviceEl) serviceEl.innerText = `Styl: ${booking.serviceName} | Miejsce: ${booking.placement} (${booking.approxSize || 'Standard'})`;
    if (descEl) descEl.innerText = `Opis klienta: "${booking.ideaDesc}"`;

    if (modal) modal.classList.remove('hidden');
}

function closeAdminPhotoModal() {
    const modal = document.getElementById('admin-photo-modal');
    if (modal) modal.classList.add('hidden');
}

function navigateToAdmin() {
    window.location.hash = '#admin';
    checkAdminRoute();
}

window.addEventListener('hashchange', checkAdminRoute);

/* === LIGHTBOX DLA GALERII PORTFOLIO === */
const portfolioItems = [
    { src: 'portfolio-1.png', title: 'Antyczny Bóg & Liście Laurowe', tag: 'Przedramię • Realism & Mitologia' },
    { src: 'portfolio-2.png', title: 'Marmurowe Muzy & Liście Akantu', tag: 'Ramię • Rzeźba Antyczna' },
    { src: 'portfolio-3.png', title: 'Monumentalne Mitologiczne Plecy', tag: 'Całe Plecy • Blackwork & Liberum Anima' },
    { src: 'portfolio-4.png', title: 'Motyl ze Strukturą Czaszki', tag: 'Przedramię • Dotwork & Dark' }
];

let currentLightboxIndex = 0;

function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();
    const lb = document.getElementById('portfolio-lightbox');
    if (lb) lb.classList.remove('hidden');
}

function closeLightbox() {
    const lb = document.getElementById('portfolio-lightbox');
    if (lb) lb.classList.add('hidden');
}

function updateLightboxContent() {
    const item = portfolioItems[currentLightboxIndex];
    if (!item) return;
    const imgEl = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const counterEl = document.getElementById('lightbox-counter');
    const tagEl = document.getElementById('lightbox-subtitle');

    if (imgEl) imgEl.src = item.src;
    if (titleEl) titleEl.innerText = item.title;
    if (tagEl) tagEl.innerText = item.tag;
    if (counterEl) counterEl.innerText = `${currentLightboxIndex + 1} / ${portfolioItems.length}`;
}

function nextLightboxImage(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
    updateLightboxContent();
}

function prevLightboxImage(e) {
    if (e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
    updateLightboxContent();
}

function handleLightboxBackdropClick(e) {
    if (e.target.id === 'portfolio-lightbox' || e.target.id === 'lightbox-image-container') {
        closeLightbox();
    }
}

/* === COOKIES & PRIVACY MODAL === */
function acceptCookies() {
    localStorage.setItem('ikigaj_cookies_accepted', 'true');
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => banner.classList.add('hidden'), 500);
    }
}

function checkCookieConsent() {
    if (!localStorage.getItem('ikigaj_cookies_accepted')) {
        setTimeout(() => {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.remove('hidden');
                setTimeout(() => banner.classList.remove('translate-y-full', 'opacity-0'), 100);
            }
        }, 1200);
    }
}

function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (modal) modal.classList.add('hidden');
}

/* === MODAL WŁAŚCICIELA STRONY (DEMO CONTACT) === */
function openContactOwnerModal() {
    const content = `
        <div class="text-left">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl border border-white/15">
                    <i class="fa-solid fa-code"></i>
                </div>
                <div>
                    <h3 class="font-cinzel text-xl font-bold text-white">Strona Demonstracyjna</h3>
                    <p class="text-xs text-slate-400">Projekt dedykowany dla IKIGAJ TATTOO</p>
                </div>
            </div>

            <p class="text-sm text-slate-300 leading-relaxed mb-5 font-light">
                Ta witryna została stworzona jako interaktywny projekt pokazowy dla studia <strong>IKIGAJ TATTOO</strong> w Nowym Sączu.
            </p>

            <div class="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6">
                <span class="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Kontakt do twórcy projektu:</span>
                <div class="text-sm font-mono text-white font-bold select-all break-all bg-white/5 p-2 rounded-lg border border-white/10">
                    kacperekwas1@gmail.com
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="mailto:kacperekwas1@gmail.com?subject=Wycena%20strony%20dla%20IKIGAJ%20TATTOO" class="bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-envelope"></i>
                    <span>Napisz wiadomość</span>
                </a>
                <button onclick="closeCustomModal()" class="bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition border border-white/15">
                    Zamknij
                </button>
            </div>
        </div>
    `;
    const modalBackdrop = document.getElementById('custom-modal-backdrop');
    const modalBox = document.getElementById('custom-modal-box');
    const modalContent = document.getElementById('custom-modal-content');
    if (modalBackdrop && modalBox && modalContent) {
        modalContent.innerHTML = content;
        modalBackdrop.classList.remove('hidden');
        setTimeout(() => {
            modalBox.classList.remove('scale-95', 'opacity-0');
            modalBox.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
}

function showCustomModal(title, msg, type = 'info') {
    let icon = 'fa-circle-info text-slate-300';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-amber-400';
    if (type === 'success') icon = 'fa-circle-check text-emerald-400';

    const content = `
        <div class="text-center py-2">
            <i class="fa-solid ${icon} text-4xl mb-4"></i>
            <h3 class="font-cinzel text-xl font-bold text-white mb-2">${title}</h3>
            <p class="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto mb-6 font-light">${msg}</p>
            <button onclick="closeCustomModal()" class="bg-white text-black px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition">
                Rozumiem
            </button>
        </div>
    `;
    const modalBackdrop = document.getElementById('custom-modal-backdrop');
    const modalBox = document.getElementById('custom-modal-box');
    const modalContent = document.getElementById('custom-modal-content');
    if (modalBackdrop && modalBox && modalContent) {
        modalContent.innerHTML = content;
        modalBackdrop.classList.remove('hidden');
        setTimeout(() => {
            modalBox.classList.remove('scale-95', 'opacity-0');
            modalBox.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
}

function closeCustomModal() {
    const modalBackdrop = document.getElementById('custom-modal-backdrop');
    const modalBox = document.getElementById('custom-modal-box');
    if (modalBox && modalBackdrop) {
        modalBox.classList.add('scale-95', 'opacity-0');
        modalBox.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => modalBackdrop.classList.add('hidden'), 250);
    }
}

/* === HIPNOTYZUJĄCY DYM W TLE (AMBIENT SMOKE & MIST CANVAS) === */
function initAmbientSmoke() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    // Cząsteczki dymu / mgły reagujące na scroll
    const smokeParticles = [];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
        smokeParticles.push({
            x: Math.random(),
            y: Math.random(),
            radius: 140 + Math.random() * 220,
            vx: (Math.random() - 0.5) * 0.0004,
            vy: (Math.random() - 0.5) * 0.0003,
            alpha: 0.03 + Math.random() * 0.045,
            pulseSpeed: 0.002 + Math.random() * 0.003,
            pulsePhase: Math.random() * Math.PI * 2
        });
    }

    let lastScrollY = window.scrollY;
    let scrollDelta = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollDelta = (currentScrollY - lastScrollY) * 0.00008;
        lastScrollY = currentScrollY;
    }, { passive: true });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Subtelne tłumienie skrętu scrolla
        scrollDelta *= 0.95;

        smokeParticles.forEach(p => {
            p.x += p.vx + scrollDelta * 0.5;
            p.y += p.vy - scrollDelta;
            p.pulsePhase += p.pulseSpeed;

            if (p.x < -0.2) p.x = 1.2;
            if (p.x > 1.2) p.x = -0.2;
            if (p.y < -0.2) p.y = 1.2;
            if (p.y > 1.2) p.y = -0.2;

            const px = p.x * width;
            const py = p.y * height;
            const currentAlpha = p.alpha * (0.8 + 0.2 * Math.sin(p.pulsePhase));

            const grad = ctx.createRadialGradient(px, py, 0, px, py, p.radius);
            grad.addColorStop(0, `rgba(220, 226, 238, ${currentAlpha})`);
            grad.addColorStop(0.5, `rgba(160, 170, 190, ${currentAlpha * 0.5})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* === SCROLL REVEAL === */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

/* === PŁYNNE FAQ ACCORDION === */
function initFaqAccordion() {
    const allDetails = document.querySelectorAll('details.faq-item');
    allDetails.forEach((targetDetail) => {
        targetDetail.addEventListener('click', (e) => {
            if (e.target.closest('summary')) {
                allDetails.forEach((otherDetail) => {
                    if (otherDetail !== targetDetail && otherDetail.open) {
                        otherDetail.open = false;
                    }
                });
            }
        });
    });
}

/* === MENU MOBILNE === */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('mobile-menu-icon');
    if (!mobileMenu) return;

    mobileMenu.classList.toggle('hidden');
    if (menuIcon) {
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.className = 'fa-solid fa-bars text-xl';
        } else {
            menuIcon.className = 'fa-solid fa-xmark text-xl';
        }
    }
}

/* === INICJALIZACJA PRZY STARCIE === */
document.addEventListener('DOMContentLoaded', () => {
    ensureInitialDemoData();
    initAmbientSmoke();
    initScrollReveal();
    initFaqAccordion();
    renderCalendar();
    checkAdminRoute();
    checkCookieConsent();

    // Rejestracja zdarzeń formularzy
    const bookingForm = document.getElementById('main-booking-form');
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);

    const adminForm = document.getElementById('admin-login-form');
    if (adminForm) adminForm.addEventListener('submit', handleAdminLogin);

    // Klawisze klawiatury dla modali i lightboxa
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closePrivacyModal();
            closeCustomModal();
            closeAdminPhotoModal();
        }
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    });

    // Płynne zamykanie dropdowna krajów przy kliknięciu poza
    document.addEventListener('click', (e) => {
        const dd = document.getElementById('country-dropdown-menu');
        const trigger = document.getElementById('country-select-trigger');
        if (dd && !dd.classList.contains('hidden')) {
            if (trigger && !trigger.contains(e.target) && !dd.contains(e.target)) {
                toggleCountryDropdown(false);
            }
        }
    });
});
