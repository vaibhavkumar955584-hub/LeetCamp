const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const files = [
  { name: 'Two_Pointers.csv', id: '1--McPyzj2QnWkgYP8-Oz_KwSd9nDFk9v' },
  { name: 'Sqrt_Decomposition.csv', id: '16MkgkR4swnOZ7VXQlrhA3YATgIgD0MX0' },
  { name: 'Stack.csv', id: '1HkA_O7m3DkxVENgMZYnMCC4CZrdpgNB7' },
  { name: 'Strings.csv', id: '1Er49YP10zgcce9PfLtzC0s9FG-RyhaHy' },
  { name: 'Topological_Sort.csv', id: '1ShiBqUWN-37pMyjfLX2nBautWCvpBWhF' },
  { name: 'Tree.csv', id: '1Us-qOHayzYcFqwbggcGj2ehTewiG6sHJ' },
  { name: 'Trie.csv', id: '1I0kx9KvDbcrMcp74aZCNnYVU2C0qdxaW' },
  { name: 'Sorting.csv', id: '1bs6JMiqne8K-qgch0oTNVE1Jl7kWr4uT' },
  { name: 'Sliding_Window.csv', id: '18a5G-bt5QxYCdZSmzKBsr7JBVqAz63VH' },
  { name: 'Shortest_Path.csv', id: '1qGvrJwoqzwwcQByJanDrENTRk1cSe_zq' },
  { name: 'Set.csv', id: '1rO8BhoYlp7ZXezBUIviXoolnKvMi30fH' },
  { name: 'Segment_Tree.csv', id: '1i1vtnqVgP8vDKj3rruXlqDAQ8huEdu_7' },
  { name: 'Searching.csv', id: '1luU0rVMIeXLnGXp9mkf2zlMbpkWnZq8Z' },
  { name: 'Recursion.csv', id: '1Avm_xhcQaL3nBqjQpsVqHqSxHz54Xgd_' },
  { name: 'Queue.csv', id: '12dxxIZv25ZrlIIolgzSB3wGwPkFqYrhh' },
  { name: 'Priority_Queue.csv', id: '1hYVR1iMeVPZM3jSnscEGzVcWuql7lJ_d' },
  { name: 'Prefix_Sum.csv', id: '1gSIVzRtvpIQbKUrUL6ZzhfOE6f8Z1_hy' },
  { name: 'Number_Theory.csv', id: '1eKn9hFSkjZqNzHFFvDOzprPKyBOZV-oh' },
  { name: 'Merge_Sort.csv', id: '10zygOtf9W0x333h7R6VmVzZAhrofAsIZ' },
  { name: 'Matrix.csv', id: '1cQbdjs45Upw9nvfEvUb522ZJ6cFIY8AP' },
  { name: 'Mathematics.csv', id: '1fCMWH-4UMnks93MCISJHL0PFqnuaj7Jg' },
  { name: 'Map.csv', id: '1ZWXBSrg88P8Ms-bRpSEqHjic-sCqrxCi' },
  { name: 'Linked_List.csv', id: '1QpUUR9j0uf0c2Q6kS4wpLFcAhLtChYeH' },
  { name: 'LCS.csv', id: '1bNQm34kzGrEKhkcXNECKn6A3gQheVMCU' },
  { name: 'Kadane.csv', id: '1fC4dXsAdaS4Hv9fIXu4agaP3zigtZNXM' },
  { name: 'Heap.csv', id: '1deJkUhv_cZNe8HXECZmlqhdpzERRaoJ_' },
  { name: 'Hashing.csv', id: '1oipLEWKc23E1ZEq6F5eXWnRZ05uBavKr' },
  { name: 'Greedy.csv', id: '1cuNU0nDVuj8yYkojRiqs2LyUY_jGBZzl' },
  { name: 'Graph.csv', id: '1A7FhIvfMkIwKpRWhz2Qw0oyBWaRygUgg' },
  { name: 'Geometric.csv', id: '155X3EsA9j4K06LvU_vdbtVDCTpImEmh6' },
  { name: 'Game_Theory.csv', id: '1LRBiZ4E2fbry95ZXo2i8OS8iOQgkljYY' },
  { name: 'Dynamic_Programming.csv', id: '1XHiiuC3SdkJbGGqXnRQctFaFCAfz3MQm' },
  { name: 'Doubly_Linked_List.csv', id: '1GAqh7M7_Z1PwRNn16NRWMSOyLtsI_ra0' },
  { name: 'Divide_and_Conquer.csv', id: '1-qzrNoeRQb28GsWdJ30KE0bLI4Fnzua0' },
  { name: 'Disjoint_Set.csv', id: '1mUkL0Wd1drkZ_cG-u7UBuMQuRX1WizNQ' },
  { name: 'DFS.csv', id: '193sdg1c_osgzAF_RlzAI1vsclvPXLgmf' },
  { name: 'Deque.csv', id: '1j3UHUmmd3ibHhCSBvW4LE_vLcI5DSz1N' },
  { name: 'Combinatorial.csv', id: '1l3O4JcdqJHsi0HTIV0p70NMrE8cWU_Qs' },
  { name: 'Circular_Linked_List.csv', id: '1VSLKPpOOZmtsaSqp5nJFoyTX3GJj9N_i' },
  { name: 'Bit_Magic.csv', id: '15A_AQvgehiSPvMbo6bXvmSqpTtZc87F5' },
  { name: 'Binary_Tree.csv', id: '1e46jxg-YQ2S4znjtwi33O6TwDrz8A8Tm' },
  { name: 'Binary_Search.csv', id: '1wd_cIM-TZVyn1EJIKz6UEeh2fO50hugG' },
  { name: 'Binary_Search_Tree.csv', id: '1mzWYfxjZFywecblSLRW_NXfJdxkHiVQN' },
  { name: 'Binary_Indexed_Tree.csv', id: '1RaSbXWmI8GoPQ8XAAScShLqEPXMDXAJI' },
  { name: 'BFS.csv', id: '1pQlljky3mIr2itOdjCYMEv6vhcFmLdZp' },
  { name: 'Backtracking.csv', id: '1U_0nYf6gi3epkZsrv_e7ejQ9QQCdjrRr' },
  { name: 'AVL_Tree.csv', id: '1Y7zhKDhmMpWJor1T4OOj2FpLz5lLKmmX' },
  { name: 'Arrays.csv', id: '1xtOdFBqRoCOah7wsr4BOC8mF4FdTMTUG' }
];

const destDir = path.join(__dirname, '..', 'data', 'dsa_patterns_drive');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(fileInfo) {
  return new Promise((resolve) => {
    const url = `https://drive.usercontent.google.com/download?id=${fileInfo.id}&export=download&confirm=t`;
    const outPath = path.join(destDir, fileInfo.name);

    function fetchUrl(targetUrl, redirects = 0) {
      if (redirects > 5) {
        console.error(`Too many redirects for ${fileInfo.name}`);
        return resolve(false);
      }
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrl(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          console.error(`Failed ${fileInfo.name}: HTTP ${res.statusCode}`);
          return resolve(false);
        }
        const fileStream = fs.createWriteStream(outPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const size = fs.statSync(outPath).size;
          console.log(`Downloaded ${fileInfo.name} (${size} bytes)`);
          resolve(true);
        });
      }).on('error', (err) => {
        console.error(`Error downloading ${fileInfo.name}:`, err.message);
        resolve(false);
      });
    }

    fetchUrl(url);
  });
}

async function run() {
  console.log(`Starting download of ${files.length} CSV files...`);
  let downloaded = 0;
  for (const f of files) {
    const ok = await downloadFile(f);
    if (ok) downloaded++;
    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Finished downloading ${downloaded}/${files.length} CSV files.`);
}

run();
