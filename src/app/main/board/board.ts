import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BoardView } from "./board-view/board-view";


@Component({
	selector: "app-board",
	imports: [CommonModule, BoardView],
	templateUrl: "./board.html",
	styleUrl: "./board.scss",
})
export class Board {
	isTaskViewOpen = false;
	openTaskView() {
		this.isTaskViewOpen = true;
	}

	vps = inject(ViewportScroller);
	route = inject(ActivatedRoute);
	router = inject(Router);
}
