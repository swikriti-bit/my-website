// Booking Management API
// This file provides functions to handle car bookings using JSON file storage

const BOOKINGS_FILE = '../data/bookings.json';

// Car brands available
const CAR_BRANDS = [
    'Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 
    'Hyundai', 'Kia', 'Nissan', 'Ford', 'Chevrolet', 'Tesla',
    'Mazda', 'Subaru', 'Mitsubishi', 'Jaguar', 'Land Rover', 'Volvo'
];

// Locations in Accra
const ACCRA_LOCATIONS = [
    'Accra Mall', 'Kotoka International Airport', 'University of Ghana',
    'Labone Beach', 'Osu Oxford Street', 'Aburi Botanical Gardens',
    'Independence Square', 'Kwame Nkrumah Memorial Park', 'Art Centre',
    'Makola Market', 'Tema Port', 'Ashongman Estate', 'East Legon',
    'Airport Residential Area', 'Cantonments', 'Dzorwulu', 'Labone'
];

// Car models by brand
const CAR_MODELS = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Yaris'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Fit', 'HR-V'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series', '2 Series'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class', 'A-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'A3', 'Q3'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
    'Hyundai': ['Elantra', 'Santa Fe', 'Tucson', 'Sonata', 'Kona', 'Palisade'],
    'Kia': ['Optima', 'Sorento', 'Sportage', 'Forte', 'Telluride', 'Soul']
};

// Load bookings from JSON file
async function loadBookings() {
    try {
        // For local development, we'll use localStorage as primary storage
        if (typeof(Storage) !== "undefined") {
            const localStorageBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            
            // If localStorage is empty, try to initialize with sample data
            if (localStorageBookings.length === 0) {
                try {
                    const response = await fetch(BOOKINGS_FILE);
                    if (response.ok) {
                        const fileBookings = await response.json();
                        if (fileBookings.length > 0) {
                            localStorage.setItem('bookings', JSON.stringify(fileBookings));
                            return fileBookings;
                        }
                    }
                } catch (fileError) {
                    console.log('Could not load from file, using empty localStorage');
                }
            }
            
            return localStorageBookings;
        }
        
        return [];
    } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
    }
}

// Save booking to localStorage
function saveBookingToLocalStorage(booking) {
    if (typeof(Storage) !== "undefined") {
        let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return true;
    }
    return false;
}

// Save new booking
async function saveBooking(booking) {
    try {
        // Save to localStorage
        saveBookingToLocalStorage(booking);
        
        return { success: true, message: 'Booking saved successfully' };
    } catch (error) {
        console.error('Error saving booking:', error);
        return { success: false, message: 'Failed to save booking' };
    }
}

// Get all bookings
async function getAllBookings() {
    try {
        const bookings = await loadBookings();
        return bookings;
    } catch (error) {
        console.error('Error getting bookings:', error);
        
        // Final fallback to localStorage
        if (typeof(Storage) !== "undefined") {
            return JSON.parse(localStorage.getItem('bookings') || '[]');
        }
        
        return [];
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    try {
        let bookings = await getAllBookings();
        const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = status;
            
            // Update localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem('bookings', JSON.stringify(bookings));
            }
            
            return { success: true, message: 'Booking status updated' };
        }
        
        return { success: false, message: 'Booking not found' };
    } catch (error) {
        console.error('Error updating booking status:', error);
        return { success: false, message: 'Failed to update booking status' };
    }
}

// Get car brands
function getCarBrands() {
    return CAR_BRANDS;
}

// Get locations in Accra
function getAccraLocations() {
    return ACCRA_LOCATIONS;
}

// Get car models by brand
function getCarModels(brand) {
    return CAR_MODELS[brand] || [];
}

// Calculate booking price
function calculateBookingPrice(carBrand, carModel, days) {
    const basePrices = {
        'Toyota': 50,
        'Honda': 55,
        'BMW': 120,
        'Mercedes': 130,
        'Audi': 115,
        'Tesla': 150,
        'Hyundai': 45,
        'Kia': 40
    };
    
    const basePrice = basePrices[carBrand] || 60;
    return basePrice * days;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadBookings,
        saveBooking,
        getAllBookings,
        updateBookingStatus,
        getCarBrands,
        getAccraLocations,
        getCarModels,
        calculateBookingPrice
    };
}
