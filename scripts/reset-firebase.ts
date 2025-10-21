#!/usr/bin/env ts-node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

/**
 * Reset Firebase Configuration and Data Script (TypeScript)
 *
 * This script performs a complete reset:
 * 1. Deletes all data from Firestore (tasks & contacts collections)
 * 2. Resets environment configuration to template state
 * 3. Clears project info files
 *
 * WARNING: This will permanently delete all data in your Firestore database!
 *
 * Usage: npm run reset:firebase
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

function resetEnvironmentFile(): boolean {
	const envPath = path.join(__dirname, "..", "src", "environment", "environment.ts");
	const templatePath = path.join(__dirname, "..", "src", "environment", "environment.template.ts");

	try {
		if (fs.existsSync(templatePath)) {
			fs.copyFileSync(templatePath, envPath);
			log("[SUCCESS] Environment reset to template state", "green");
			return true;
		} else {
			log("[ERROR] Template file not found", "red");
			return false;
		}
	} catch (error: any) {
		log(`[ERROR] Failed to reset environment: ${error.message}`, "red");
		return false;
	}
}

function clearProjectInfo(): void {
	const infoPath = path.join(__dirname, "..", "firebase-project-info.txt");

	try {
		if (fs.existsSync(infoPath)) {
			fs.unlinkSync(infoPath);
			log("[SUCCESS] Project info file removed", "green");
		}
	} catch (error: any) {
		log(`[WARNING] Could not remove project info file: ${error.message}`, "yellow");
	}
}

function clearInitializationFlag(): void {
	log("[SUCCESS] Firebase initialization flag will be cleared on next app start", "green");
	log("[INFO] The flag is stored in browser localStorage", "cyan");
}

async function askConfirmation(question: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
		});
	});
}

function readFirebaseConfig(): FirebaseConfig | null {
	const envPath = path.join(__dirname, "..", "src", "environment", "environment.ts");

	if (!fs.existsSync(envPath)) {
		log("[WARNING] Environment file not found - skipping data deletion", "yellow");
		return null;
	}

	const envContent = fs.readFileSync(envPath, "utf8");

	if (!envContent.includes("firebaseConfig") || !envContent.includes("projectId")) {
		log("[WARNING] No valid Firebase config found - skipping data deletion", "yellow");
		return null;
	}

	try {
		const configMatch = envContent.match(/firebaseConfig\s*=\s*\{([^}]+)\}/s);
		if (!configMatch) return null;

		const configString = "{" + configMatch[1] + "}";
		const lines = configString.split("\n");
		const config: Partial<FirebaseConfig> = {};

		for (const line of lines) {
			if (
				line.trim().startsWith("/*") ||
				line.trim().startsWith("*") ||
				line.trim().startsWith("//") ||
				!line.includes(":")
			) {
				continue;
			}
			const keyValueMatch = line.match(/["']?(\w+)["']?\s*:\s*["']([^"']+)["']/);
			if (keyValueMatch) {
				config[keyValueMatch[1] as keyof FirebaseConfig] = keyValueMatch[2];
			}
		}

		if (!config.projectId) return null;

		log(`[INFO] Found Firebase project: ${config.projectId}`, "cyan");
		return config as FirebaseConfig;
	} catch (error) {
		log("[WARNING] Could not parse Firebase config - skipping data deletion", "yellow");
		return null;
	}
}

async function deleteFirestoreData(config: FirebaseConfig): Promise<void> {
	log("Deleting all Firestore data...", "cyan");

	const deleteScript = `
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = ${JSON.stringify(config, null, 2)};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteCollection(collectionName) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  let deleteCount = 0;
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, document.id));
    deleteCount++;
  }

  console.log(\`[INFO] Deleted \${deleteCount} documents from '\${collectionName}' collection\`);
  return deleteCount;
}

async function deleteAllData() {
  try {
    console.log('[DELETE] Starting Firestore data deletion...');

    const tasksCount = await deleteCollection('tasks');
    const contactsCount = await deleteCollection('contacts');

    console.log(\`[SUCCESS] Deleted \${tasksCount + contactsCount} total documents\`);
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Data deletion failed:', error.message);
    process.exit(1);
  }
}

deleteAllData();
`;

	const scriptPath = path.join(__dirname, "temp-delete-data.mjs");
	fs.writeFileSync(scriptPath, deleteScript);

	try {
		execSync(`node ${scriptPath}`, { stdio: "inherit" });
		log("[SUCCESS] All Firestore data deleted", "green");
	} catch (error: any) {
		log(`[ERROR] Failed to delete data: ${error.message}`, "red");
	} finally {
		if (fs.existsSync(scriptPath)) {
			fs.unlinkSync(scriptPath);
		}
	}
}

async function main(): Promise<void> {
	log("Firebase Reset - Configuration and Data", "bright");
	log("=========================================", "blue");
	log("", "reset");

	log("WARNING: This will permanently delete ALL data from your Firestore database!", "red");
	log("This includes all tasks and contacts.", "red");
	log("", "reset");

	const firebaseConfig = readFirebaseConfig();

	if (firebaseConfig) {
		log(`Target project: ${firebaseConfig.projectId}`, "yellow");
		log("", "reset");

		const confirmed = await askConfirmation("Are you sure you want to delete all data? (y/N): ");

		if (!confirmed) {
			log("", "reset");
			log("Reset cancelled by user", "yellow");
			process.exit(0);
		}

		log("", "reset");

		log("1. Deleting all Firestore data...", "bright");
		await deleteFirestoreData(firebaseConfig);
	} else {
		log("1. No Firebase config found - skipping data deletion", "yellow");
	}

	log("2. Resetting environment configuration...", "bright");
	if (!resetEnvironmentFile()) {
		process.exit(1);
	}

	log("3. Clearing project information...", "bright");
	clearProjectInfo();

	log("4. Clearing initialization state...", "bright");
	clearInitializationFlag();

	log("", "reset");
	log("=========================================", "green");
	log("Firebase reset completed successfully!", "bright");
	log("=========================================", "green");
	log("", "reset");
	log("What was done:", "bright");
	log("- All Firestore data deleted (tasks & contacts)", "cyan");
	log("- Environment reset to shared test database", "cyan");
	log("- Project info cleared", "cyan");
	log("", "reset");
	log("Next steps:", "bright");
	log("1. Run: npm run migrate:all (to populate with sample data)", "cyan");
	log("2. Or run: npm run setup:firebase (to create new project)", "cyan");
	log("3. Or manually configure environment.ts", "cyan");
	log("", "reset");
}

main();
