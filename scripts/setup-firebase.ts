#!/usr/bin/env ts-node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Simplified Firebase Setup Script (TypeScript)
 *
 * This script automatically creates:
 * 1. A single Firebase project for all data (Tasks & Contacts)
 * 2. Firestore database with all collections
 * 3. Unified environment configuration
 * 4. Step-by-step setup
 *
 * Usage: npm run setup:firebase
 */

interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset"): void {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateProjectId(): string {
	const username = os
		.userInfo()
		.username.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
	const timestamp = Date.now().toString().slice(-6);
	return `join-unified-${username}-${timestamp}`;
}

function checkFirebaseLogin(): boolean {
	try {
		execSync("firebase projects:list", { stdio: "pipe" });
		return true;
	} catch (error) {
		return false;
	}
}

function createFirebaseProject(projectId: string): boolean {
	log(`Creating Firebase project: ${projectId}`, "cyan");

	try {
		execSync(
			`firebase projects:create ${projectId} --display-name "Join Unified - ${os.userInfo().username}"`,
			{ encoding: "utf8" },
		);
		log("[SUCCESS] Firebase project created successfully", "green");
		return true;
	} catch (error: any) {
		log(`[ERROR] Failed to create Firebase project: ${error.message}`, "red");
		return false;
	}
}

function createWebApp(projectId: string): string | null {
	log("Creating Firebase web app...", "cyan");

	try {
		const result = execSync(`firebase apps:create web "join-unified-web" --project=${projectId}`, {
			encoding: "utf8",
		});

		const appIdMatch = result.match(/App ID: (.+)/);
		if (!appIdMatch) {
			throw new Error("Could not extract App ID from Firebase CLI output");
		}

		log("[SUCCESS] Firebase web app created successfully", "green");
		return appIdMatch[1].trim();
	} catch (error: any) {
		log(`[ERROR] Failed to create web app: ${error.message}`, "red");
		return null;
	}
}

function getFirebaseConfig(projectId: string, appId: string): FirebaseConfig | null {
	log("Retrieving Firebase configuration...", "cyan");

	try {
		const result = execSync(`firebase apps:sdkconfig WEB ${appId} --project=${projectId}`, {
			encoding: "utf8",
		});

		const config = JSON.parse(result.trim()) as FirebaseConfig;
		log("[SUCCESS] Firebase configuration retrieved successfully", "green");
		return config;
	} catch (error: any) {
		log(`[ERROR] Failed to retrieve Firebase config: ${error.message}`, "red");
		return null;
	}
}

function createFirestoreDatabase(projectId: string): boolean {
	log("Creating Firestore database...", "cyan");

	try {
		execSync(
			`firebase firestore:databases:create "(default)" --project=${projectId} --location=europe-west1`,
			{ encoding: "utf8" },
		);
		log("[SUCCESS] Firestore database created successfully", "green");
		return true;
	} catch (error: any) {
		log(`[ERROR] Failed to create Firestore database: ${error.message}`, "red");
		return false;
	}
}

function updateEnvironmentFile(config: FirebaseConfig): boolean {
	log("Updating environment configuration...", "cyan");

	const envPath = path.join(__dirname, "..", "src", "environment", "environment.ts");

	try {
		const envContent = `// UNIFIED FIREBASE CONFIG - for all data (Tasks & Contacts)
export const firebaseConfig = {
    apiKey: "${config.apiKey}",
    authDomain: "${config.authDomain}",
    projectId: "${config.projectId}",
    storageBucket: "${config.storageBucket}",
    messagingSenderId: "${config.messagingSenderId}",
    appId: "${config.appId}",
};

// ENVIRONMENT FLAGS
export const environment = {
    production: false,
};
`;

		fs.writeFileSync(envPath, envContent);
		log("[SUCCESS] Environment configuration updated successfully", "green");
		return true;
	} catch (error: any) {
		log(`[ERROR] Failed to update environment: ${error.message}`, "red");
		return false;
	}
}

function generateProjectInfo(config: FirebaseConfig): void {
	const projectInfo = `
# Firebase Project Information
Project ID: ${config.projectId}
Project URL: https://console.firebase.google.com/project/${config.projectId}
Firestore URL: https://console.firebase.google.com/project/${config.projectId}/firestore

# Generated Configuration
API Key: ${config.apiKey}
Auth Domain: ${config.authDomain}
Storage Bucket: ${config.storageBucket}
Messaging Sender ID: ${config.messagingSenderId}
App ID: ${config.appId}

# Setup completed at: ${new Date().toISOString()}
`;

	const infoPath = path.join(__dirname, "..", "firebase-project-info.txt");
	fs.writeFileSync(infoPath, projectInfo);
	log(`[SUCCESS] Project info saved to: firebase-project-info.txt`, "green");
}

async function main(): Promise<void> {
	log("Firebase Setup - Unified Database", "bright");
	log("==================================", "blue");

	log("1. Checking Firebase CLI authentication...", "bright");
	if (!checkFirebaseLogin()) {
		log("[ERROR] Not logged in to Firebase CLI", "red");
		log("Please run: firebase login", "yellow");
		process.exit(1);
	}
	log("[SUCCESS] Firebase CLI authenticated", "green");

	const projectId = generateProjectId();
	log(`2. Generated unique project ID: ${projectId}`, "bright");

	log("3. Creating Firebase project...", "bright");
	if (!createFirebaseProject(projectId)) {
		process.exit(1);
	}

	log("4. Setting up web app...", "bright");
	const appId = createWebApp(projectId);
	if (!appId) {
		process.exit(1);
	}

	log("5. Retrieving configuration...", "bright");
	const config = getFirebaseConfig(projectId, appId);
	if (!config) {
		process.exit(1);
	}

	log("6. Setting up Firestore database...", "bright");
	if (!createFirestoreDatabase(projectId)) {
		process.exit(1);
	}

	log("7. Updating project configuration...", "bright");
	if (!updateEnvironmentFile(config)) {
		process.exit(1);
	}

	generateProjectInfo(config);

	log("==================================", "green");
	log("Setup completed successfully!", "bright");
	log("==================================", "green");
	log("", "reset");
	log("Next steps:", "bright");
	log("1. Start development server: npm start", "cyan");
	log("2. Open browser to see the app with sample data", "cyan");
	log(
		`3. Visit Firebase Console: https://console.firebase.google.com/project/${projectId}`,
		"cyan",
	);
	log("", "reset");
	log("Your team members can run the same setup with:", "yellow");
	log("npm run setup:firebase", "bright");
}

main().catch((error) => {
	log(`Setup failed: ${error.message}`, "red");
	process.exit(1);
});
