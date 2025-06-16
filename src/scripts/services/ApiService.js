export default class ApiService {
    constructor() {
        this.baseUrl = 'https://story-api.dicoding.dev/v1';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem('authToken');

        const isFormData = options.body instanceof FormData;

        // Setup headers
        const headers = {
            'Accept': 'application/json',
            ...(options.headers || {}),
        };

        // PERBAIKAN: Jangan set Content-Type untuk FormData sama sekali
        // Browser akan otomatis set Content-Type dengan boundary yang benar
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        // Tambahkan Authorization header jika ada token dan bukan endpoint guest
        if (token && !endpoint.includes('/guest')) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        console.log('Request config:', {
            url,
            method: config.method || 'GET',
            hasFormData: isFormData,
            headersSet: Object.keys(headers),
            hasAuthToken: !!token
        });

        try {
            const response = await fetch(url, config);

            // Cek apakah response berupa JSON
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            let data;
            try {
                data = isJson ? await response.json() : await response.text();
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error(`Failed to parse response: ${parseError.message}`);
            }

            if (!response.ok) {
                // Buat error message yang lebih informatif
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                if (isJson && data && data.message) {
                    errorMessage = data.message;
                } else if (typeof data === 'string') {
                    errorMessage = data;
                }

                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });

                throw new Error(errorMessage);
            }

            console.log('API Success Response:', {
                status: response.status,
                hasData: !!data,
                dataType: typeof data
            });

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            
            // Jika error adalah network error atau fetch error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your internet connection');
            }
            
            throw error;
        }
    }

    async register(name, email, password) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async login(email, password) {
        const response = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        return response;
    }

    async getStories(location = 1) {
        return this.request(`/stories?location=${location}`);
    }

    async addStory(formData) {
        // Debug: cek parameter yang masuk
        console.log('ApiService.addStory called with:', {
            parameterType: typeof formData,
            constructor: formData?.constructor?.name,
            isFormData: formData instanceof FormData
        });

        // Validasi FormData
        if (!(formData instanceof FormData)) {
            throw new Error('addStory expects FormData as parameter');
        }

        // Validasi required fields
        if (!formData.has('description')) {
            throw new Error('Description is required');
        }

        if (!formData.has('photo')) {
            throw new Error('Photo is required');
        }

        const photo = formData.get('photo');
        if (!(photo instanceof File)) {
            throw new Error('Photo must be a File object');
        }

        // Validasi ukuran file (maksimal 1MB)
        const maxSize = 1024 * 1024; // 1MB
        if (photo.size > maxSize) {
            throw new Error('Photo size must be less than 1MB');
        }

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(photo.type)) {
            throw new Error('Photo must be JPEG or PNG format');
        }

        console.log('FormData validation passed, sending request...');

        return this.request('/stories', {
            method: 'POST',
            body: formData,
        });
    }

    async addStoryGuest(formData) {
        // Validasi yang sama seperti addStory
        if (!(formData instanceof FormData)) {
            throw new Error('addStoryGuest expects FormData as parameter');
        }

        return this.request('/stories/guest', {
            method: 'POST',
            body: formData,
        });
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
    }

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    async subscribeToNotifications(subscription) {
      // Ubah objek subscription dari browser agar sesuai dengan body request yang diminta API
      const subJSON = subscription.toJSON();
      const requestBody = {
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
        },
      };

      console.log('Mengirim data subscription ke server:', requestBody);

      // Panggil metode request yang sudah ada untuk mengirim data
      return this.request('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        // Header 'Authorization' dan 'Content-Type' akan otomatis ditambahkan oleh metode `request`
      });
    }
}