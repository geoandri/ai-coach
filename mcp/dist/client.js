import axios from 'axios';
export class AiCoachClient {
    http;
    publicBaseUrl;
    constructor(baseUrl, publicBaseUrl) {
        this.http = axios.create({ baseURL: baseUrl });
        this.publicBaseUrl = publicBaseUrl ?? baseUrl;
    }
    // Athletes
    async listAthletes() {
        const { data } = await this.http.get('/athletes');
        return data;
    }
    async getAthlete(athleteId) {
        const { data } = await this.http.get(`/athletes/${athleteId}`);
        return data;
    }
    async createAthlete(request) {
        const { data } = await this.http.post('/athletes', request);
        return data;
    }
    async updateAthlete(athleteId, request) {
        const { data } = await this.http.put(`/athletes/${athleteId}`, request);
        return data;
    }
    async addCoachNote(athleteId, note) {
        const { data } = await this.http.post(`/athletes/${athleteId}/coach-notes`, { note });
        return data;
    }
    // Training Plans
    async getTrainingPlan(athleteId) {
        try {
            const { data } = await this.http.get(`/athletes/${athleteId}/training-plan`);
            return data;
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404)
                return null;
            throw e;
        }
    }
    async getTrainingPlanSummary(athleteId) {
        try {
            const { data } = await this.http.get(`/athletes/${athleteId}/training-plan/summary`);
            return data;
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404)
                return null;
            throw e;
        }
    }
    async createTrainingPlan(athleteId, request) {
        const { data } = await this.http.post(`/athletes/${athleteId}/training-plan`, request);
        return data;
    }
    async deleteTrainingPlan(athleteId, planId) {
        await this.http.delete(`/athletes/${athleteId}/training-plans/${planId}`);
    }
    async getWeekDetail(athleteId, weekNumber) {
        try {
            const { data } = await this.http.get(`/athletes/${athleteId}/training-plan/week/${weekNumber}`);
            return data;
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404)
                return null;
            throw e;
        }
    }
    async updateWeek(athleteId, weekNumber, request) {
        const { data } = await this.http.patch(`/athletes/${athleteId}/training-plan/weeks/${weekNumber}`, request);
        return data;
    }
    // Plan vs Actual
    async getPlanVsActual(athleteId, startDate, endDate) {
        const { data } = await this.http.get(`/athletes/${athleteId}/plan-vs-actual`, {
            params: { startDate, endDate }
        });
        return data;
    }
    // Dashboard
    async getDashboardSummary(athleteId) {
        const { data } = await this.http.get(`/athletes/${athleteId}/dashboard/summary`);
        return data;
    }
    // Activities
    async syncActivities(athleteId, afterDate) {
        const params = new URLSearchParams();
        if (afterDate)
            params.set('afterDate', afterDate);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const { data } = await this.http.get(`/athletes/${athleteId}/activities/sync${qs}`);
        return data;
    }
    async connectIntervalsIcu(athleteId, intervalsAthleteId, apiKey) {
        const { data } = await this.http.post(`/athletes/${athleteId}/auth/intervals-icu`, { athleteId: intervalsAthleteId, apiKey });
        return data;
    }
    async disconnectIntervalsIcu(athleteId) {
        await this.http.delete(`/athletes/${athleteId}/auth/intervals-icu`);
    }
    async getIntervalsIcuStatus(athleteId) {
        const { data } = await this.http.get(`/athletes/${athleteId}/auth/intervals-icu/status`);
        return data;
    }
}
//# sourceMappingURL=client.js.map