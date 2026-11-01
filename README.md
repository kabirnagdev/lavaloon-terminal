<img width="735" height="420" alt="image" src="https://github.com/user-attachments/assets/e6c75473-627a-4ac9-8640-995a97c4bb5c" />





A hybrid RAG system exploring how knowledge graphs, semantic search, and LLMs can answer questions about financial survey data.

### Dataset

The project uses a structured CSV dataset containing survey responses about investment preferences, savings objectives, and related financial attributes. Each row represents a record, while selected categorical values become entities in the knowledge graph.

**Note:** This is survey data, not live stock prices or financial filings.
### How it approaches
<img width="1024" height="507" alt="image" src="https://github.com/user-attachments/assets/0ffb34b6-4748-47b3-a8c3-fda5178e5e52" />


while this is how classical vector only rag works 
<img width="828" height="433" alt="image" src="https://github.com/user-attachments/assets/554abb1b-1933-4548-b09b-759aab8f2f25" />

### How It Works

1. **Load Data** — Clean the CSV and identify categorical and property columns.
2. **Build Knowledge Graph** — Connect records to entities and discover co-occurrence relationships using lift.
3. **Generate Embeddings** — Encode records, entity labels, and column names using Sentence Transformers.
4. **Process Query** — Extract keywords, match relevant entities, perform vector search, and expand through graph relationships.
5. **Build Context** — Combine retrieved records, graph relationships, and computed statistics.
6. **Generate Answer** — Pass the evidence to a Groq-hosted LLM to produce a context-grounded response.

### Query Flow
<img width="1312" height="1199" alt="image" src="https://github.com/user-attachments/assets/c817aa4d-c2db-4de5-862b-cb8fd6fa19b8" />


### Tech Stack

`Python` · `Pandas` · `NumPy` · `NetworkX` · `RDFLib` · `Sentence Transformers` · `Scikit-learn` · `Groq`

### Run Locally

```bash
git clone https://github.com/kabirnagdev/bloomberg-terminal.git
cd bloomberg-terminal
pip install pandas numpy networkx rdflib sentence-transformers scikit-learn matplotlib groq
```

### Key Capabilities

- **Knowledge Graph Construction** — Converts tabular financial survey data into interconnected records and entities.
- **Association Mining** — Discovers co-occurrence patterns using statistical lift.
- **Hybrid Retrieval** — Combines semantic vector search, entity matching, and graph traversal.
- **Contextual Question Answering** — Uses retrieved records, relationships, and computed statistics to ground LLM responses.
- **RDF Export** — Serializes graph data into Turtle format for interoperability.
- **Plain RAG Baseline** — Supports comparison with vector-only retrieval.
- **Resilient Embeddings** — Falls back to character n-gram hashing when the embedding model is unavailable.

Open `Knowledge_graph_finance_RAG_2.ipynb` in Jupyter Notebook or Google Colab, configure the dataset path and `GROQ_API_KEY`, and run the notebook cells.

**Author:** [Kabir Nagdev](https://github.com/kabirnagdev)
**Authors:** [Kabir Nagdev](https://github.com/kabirnagdev), [Ayush Gupta](https://github.com/ayuzzgupta)

*An experimental project in knowledge graphs, hybrid retrieval, and LLM-powered data analysis.*
