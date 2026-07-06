import { useSemanticSearch } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Loader2, FileText, Users, Newspaper, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Search() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const searchMutation = useSemanticSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    searchMutation.mutate({ data: { query } });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'supplier': return <Users className="h-4 w-4 text-emerald-500" />;
      case 'news': return <Newspaper className="h-4 w-4 text-muted-foreground" />;
      case 'alert': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      default: return <SearchIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-display font-bold tracking-tight">Semantic Knowledge Search</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Query contracts, news, and supplier data using natural language. The AI understands context, intent, and relationships.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center bg-background rounded-xl border border-border/20 shadow-2xl">
          <SearchIcon className="absolute left-6 h-6 w-6 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "Show me clauses related to force majeure for Asian suppliers"'
            className="w-full bg-transparent border-none py-6 pl-16 pr-6 text-lg focus:ring-0 outline-none rounded-xl"
          />
          {searchMutation.isPending && (
            <Loader2 className="absolute right-6 h-6 w-6 text-primary animate-spin" />
          )}
        </div>
      </form>

      {hasSearched && (
        <div className="space-y-4 mt-12">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Search Results</h2>
          
          {searchMutation.isPending ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Card key={i} className="h-32 bg-muted/10 animate-pulse border-border/5" />)}
            </div>
          ) : searchMutation.data?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{query}". Try adjusting your terminology.
            </div>
          ) : (
            <div className="space-y-4">
              {searchMutation.data?.map(result => (
                <Card key={result.id} className="bg-card/50 backdrop-blur border-border/10 hover:border-primary/30 transition-colors cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors shrink-0">
                        {getIconForType(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-base truncate pr-4 group-hover:text-primary transition-colors">{result.title}</h3>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-mono text-primary border-primary/20">
                            SCORE: {result.score.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: result.snippet.replace(/<em>/g, '<span class="text-primary bg-primary/10 px-1 rounded font-medium">').replace(/<\/em>/g, '</span>') }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
