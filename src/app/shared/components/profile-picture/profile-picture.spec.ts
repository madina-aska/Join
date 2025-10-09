import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilePicture } from "@shared/components/profile-picture/profile-picture";

describe("ProfilePicture", () => {
	let component: ProfilePicture;
	let fixture: ComponentFixture<ProfilePicture>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProfilePicture],
		}).compileComponents();

		fixture = TestBed.createComponent(ProfilePicture);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
