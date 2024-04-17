export const ab2str = (buf: ArrayBuffer) => {
    const uint8Array = new Uint8Array(buf);
    const decoder = new TextDecoder('utf-8'); // Specify the encoding
    const decodedString = decoder.decode(uint8Array);
    return decodedString;
};

export const str2ab = (str: string) => {
    const buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

export interface Chunk {
    metadata: object;
    data: ArrayBuffer;
}

export const chunkFile = async (file: File, chunkSize: number): Promise<Chunk[]> => {
    return new Promise((resolve,reject) => {
        const chunks: Chunk[] = [];
        let offset = 0;
        let sequenceNumber = 0;

        const reader = new FileReader();
        chunks.push({
            metadata: {
                isHeader: true,
                isEOF: false,
                filename: file.name,
                filesize: file.size,
                type: file.type,
                numChunks: Math.ceil(file.size/chunkSize),
                currentChunk: sequenceNumber++,
            },
            data: new ArrayBuffer(0),
        });

        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                chunks.push({
                    metadata: {
                        isHeader: false,
                        isEOF: false,
                        currentChunk: sequenceNumber++,
                    },
                    data: reader.result,
                });

                if (offset<file.size) {
                    readNextChunk();
                }
                else {
                    chunks.push({
                        metadata: {
                            isHeader: false,
                            isEOF: true,
                            currentChunk: sequenceNumber,
                        },
                        data: new ArrayBuffer(0),
                    });
                    resolve(chunks);
                }
            }
        };

        reader.onerror = () => {
            reject(reader.error);
        }

        const readNextChunk = () => {
            const slice = file.slice(offset, offset+chunkSize);
            reader.readAsArrayBuffer(slice);
            offset += chunkSize;
        }

        readNextChunk();
    });
};

export const generateDummyFile = (sizeInBytes: number) => {
    const blob = new Blob([new Uint8Array(sizeInBytes)], {type: "application/octet-stream"});
    return new File([blob], "dummy"+sizeInBytes.toString());
};