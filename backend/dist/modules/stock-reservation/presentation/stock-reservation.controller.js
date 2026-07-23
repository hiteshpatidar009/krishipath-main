import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { StockReservationValidator } from "./stock-reservation.validator";
export class StockReservationController {
    createUseCase;
    releaseUseCase;
    allocateUseCase;
    fulfillUseCase;
    expireUseCase;
    listUseCase;
    summaryUseCase;
    activitiesUseCase;
    getUseCase;
    constructor(createUseCase, releaseUseCase, allocateUseCase, fulfillUseCase, expireUseCase, listUseCase, summaryUseCase, activitiesUseCase, getUseCase) {
        this.createUseCase = createUseCase;
        this.releaseUseCase = releaseUseCase;
        this.allocateUseCase = allocateUseCase;
        this.fulfillUseCase = fulfillUseCase;
        this.expireUseCase = expireUseCase;
        this.listUseCase = listUseCase;
        this.summaryUseCase = summaryUseCase;
        this.activitiesUseCase = activitiesUseCase;
        this.getUseCase = getUseCase;
    }
    get = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const reservationId = String(request.params.reservationId);
        const result = await this.getUseCase.execute(companyId, reservationId);
        if (!result) {
            ApiResponse.notFound(response, "Reservation not found");
            return;
        }
        ApiResponse.ok(response, result, "Reservation details loaded");
    };
    summary = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const result = await this.summaryUseCase.execute(companyId);
        ApiResponse.ok(response, result, "Reservation summary loaded");
    };
    activities = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const result = await this.activitiesUseCase.execute(companyId);
        ApiResponse.ok(response, result, "Reservation activities loaded");
    };
    create = async (request, response) => {
        const input = StockReservationValidator.create.parse(request.body);
        ApiResponse.created(response, await this.createUseCase.execute({
            ...input,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            idempotencyKey: String(request.header("idempotency-key")),
        }), "Reservation created");
    };
    release = this.command("release");
    allocate = this.command("allocate");
    fulfill = this.command("fulfill");
    expire = async (request, response) => {
        ApiResponse.ok(response, await this.expireUseCase.execute(RequestContext.companyId(request), RequestContext.userId(request)), "Reservations expired");
    };
    list = async (request, response) => {
        const query = StockReservationValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.listUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Reservations loaded");
    };
    command(type) {
        return async (request, response) => {
            const input = {
                companyId: RequestContext.companyId(request),
                reservationId: String(request.params.reservationId),
                actorId: RequestContext.userId(request),
            };
            const useCase = type === "release" ? this.releaseUseCase
                : type === "allocate" ? this.allocateUseCase : this.fulfillUseCase;
            ApiResponse.ok(response, await useCase.execute(input), `Reservation ${type}d`);
        };
    }
}
