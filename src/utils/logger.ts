export const logger = (msg: string) => {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/T/, " ").replace(/\..+/, ""); // Converts to YYYY-MM-DD HH:MM:SS format
    console.log(`【${formattedDate}】- ${msg}`);
};
