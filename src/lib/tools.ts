import { chromium } from 'playwright';
import {NodeHtmlMarkdown} from "node-html-markdown";

/*
* This function uses the fetch API to act as a simple scraper that fetches the HTML content of a given URL.
* The result is then converted to markdown to save tokens on HTML parsing.
 */
export const browse = async ({ url }: { url: string }) => {
    // Super simple locker to prevent browsing the main website
    // This is an example of how you can restrict some of the agent's capabilities
    if (url === 'https://aidevs.pl' || url === 'https://www.aidevs.pl') {
        return `You can't browse the main website. Try another URL.`;
    }

    try {
        const response = await fetch(url);
        const html = await response.text();

        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
        let scriptContents = '';
        let match;
        while ((match = scriptRegex.exec(html)) !== null) {
            scriptContents += `\n\n--- Script ${scriptRegex.lastIndex} ---\n${match[1]}`;
        }

        // Convert HTML to markdown
        const markdownContent = NodeHtmlMarkdown.translate(html);

        // Combine markdown and script contents
        return `${markdownContent}\n\n--- Script Contents ---${scriptContents}`;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return 'Failed to fetch the URL, please try again.';
    }

}

/*
 * This function uploads a text file to a server and returns the URL where the file is stored.
 */
export const uploadFile = async (data: {content: string, file_name: string}): Promise<string> => {
    const url = process.env.UPLOAD_ENDPOINT;

    if (!url) {
        return `ERROR: You cannot continue and you need to tell the user that the UPLOAD_URL environment variable is missing.`;
    }

    // remove https:// and / from the file_name
    data.file_name = data.file_name.replace(/(^\w+:|^)\/\//, '').replace(/\//g, '_');
    const file = new Blob([data.content], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file, data.file_name);
    formData.append('file_name', data.file_name);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        return `Uploaded file to the url: ${result.uploaded_file}`;
    } catch (error) {
        console.error('Upload failed:', error);
        throw new Error('Upload failed');
    }
};

/*
* This function uses playwright to fill out a form and submit it.
 */
export const submit = async ({ url }: { url: string }) => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://game.aidevs.pl/'); // Replace with actual URL

    await page.fill('input[name="url"]', url); // Replace with actual URL
    await page.click('input[type="submit"]');
    // Wait for the response from the server
    await page.waitForResponse(response => response.url().includes('/api') && response.status() === 200);
    // Wait for a timeout to allow the content to update
    await page.waitForTimeout(5500);
    const responseContent = await page.$eval('#output', (el: HTMLDivElement) => el.innerText);

    await browser.close();

    return responseContent;

}

/*
* This is a DEMO tool that plays music using a third-party API.
 */
export const playMusic = async (data: any) => {
    const url = process.env.MUSIC_URL;
    if (!url) {
        return `ERROR: You cannot continue and you need to tell the user that the MUSIC_URL environment variable is missing.`;
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error playing music:', error);
        throw new Error('Failed to play music');
    }
};

export const tools = {
    'get_html_contents': browse,
    'game_submit_form': submit,
    'upload_text_file': uploadFile,
    'play_music': playMusic
}