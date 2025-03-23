import axios from 'axios';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import { ExternalFunctionProcessContext, DataValue } from '@ironclad/rivet-node';

const TOKEN = process.env.LLAMAPARSE_TOKEN;

export const llamaExternalFunctions: Record<
  string,
  (context: ExternalFunctionProcessContext, ...args: unknown[]) => Promise<DataValue & { cost?: number }>
> = {
  uploadFile: async (_context, args) => {
    const { path } = args as { path: string };

    const formData = new FormData();
    formData.append('file', createReadStream(path));
    formData.append('language', 'pt');

    const response = await axios.request({
      method: 'post',
      url: 'https://api.cloud.llamaindex.ai/api/v1/parsing/upload',
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      data: formData,
    });

    return { type: 'object', value: response.data };
  },

  getJob: async (_context, args) => {
    let { id } = args as { id: string };

    const response = await axios.request({
      method: 'get',
      url: `https://api.cloud.llamaindex.ai//api/v1/parsing/job/${id}`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
    })

    return { type: 'object', value: response.data };
  },

  getMarkdownResult: async (_context, args) => {
    const { id, timeout } = args as { id: string; timeout?: number };

    if (timeout) {
      let status = '';
      for (let i = 0; status !== 'SUCCESS'; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000 )); // wait 3 seconds
        const jobResponse = await axios.request({
          method: 'get',
          url: `https://api.cloud.llamaindex.ai/api/v1/parsing/job/${id}`,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
          },
        });

        if (i > timeout) {
          throw new Error(`Timeout waiting for job ${id} to finish`);
        }

        status = jobResponse.data?.status;
      }
    }

    const response = await axios.request({
      method: 'get',
      url: `https://api.cloud.llamaindex.ai/api/v1/parsing/job/${id}/result/raw/markdown`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    return { type: 'string', value: response.data };
  },
};
