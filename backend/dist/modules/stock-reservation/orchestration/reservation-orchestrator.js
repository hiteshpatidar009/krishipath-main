export class ReservationOrchestrator {
    reservations;
    constructor(reservations) {
        this.reservations = reservations;
    }
    reserve(input) { return this.reservations.reserve(input); }
    release(input) { return this.reservations.release(input); }
}
