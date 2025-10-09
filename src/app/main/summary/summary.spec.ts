import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Summary } from "@main/summary/summary";

describe("Summary", () => {
	let component: Summary;
	let fixture: ComponentFixture<Summary>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [Summary],
		}).compileComponents();

		fixture = TestBed.createComponent(Summary);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
