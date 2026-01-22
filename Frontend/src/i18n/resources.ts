
// Use Vite's glob import to load all JSON files from public/locales
// This forces them to be bundled into the main JS file, removing the need for HTTP requests
const modules = import.meta.glob('../locales/*/*.json', { eager: true });

const resources: Record<string, Record<string, any>> = {};

for (const path in modules) {
    // Extract language and namespace from path
    // Example path: ../../public/locales/en/common.json
    const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);

    if (match) {
        const [, lng, ns] = match;

        if (!resources[lng]) {
            resources[lng] = {};
        }

        // Assign the module content (handle default export if necessary)
        resources[lng][ns] = (modules[path] as any).default || modules[path];
    }
}

export default resources;
