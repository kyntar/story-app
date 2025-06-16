import L from 'leaflet';

export default class MapService {
    constructor() {
        this.maps = {};
    }

    initMap(containerId, options = {}) {
        const defaultOptions = {
            center: [-2.5489, 118.0149], // Indonesia center
            zoom: 5,
            ...options
        };

        const map = L.map(containerId).setView(defaultOptions.center, defaultOptions.zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        this.maps[containerId] = map;
        return map;
    }

    addMarker(mapId, lat, lon, popupContent) {
        const map = this.maps[mapId];
        if (map) {
            const marker = L.marker([lat, lon]).addTo(map);
            if (popupContent) {
                marker.bindPopup(popupContent);
            }
            return marker;
        }
    }

    onMapClick(mapId, callback) {
        const map = this.maps[mapId];
        if (map) {
            map.on('click', callback);
        }
    }
}
