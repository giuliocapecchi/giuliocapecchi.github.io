import { useEffect, useState } from "react";
import { Project } from "@/types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { faGithubSquare } from "@fortawesome/free-brands-svg-icons";

function isProject(value: unknown): value is Project {
    if (!value || typeof value !== "object") return false;
    const project = value as Project;
    return typeof project.id === "number" && typeof project.name === "string" &&
        typeof project.html_url === "string" && project.html_url.startsWith("https://github.com/") &&
        (project.description === null || typeof project.description === "string") &&
        typeof project.created_at === "string" && Number.isFinite(Date.parse(project.created_at));
}

export default function Portfolio() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [attempt, setAttempt] = useState(0);
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    useEffect(() => {
        const short = window.matchMedia("(max-height: 600px)");
        const narrow = window.matchMedia("(max-width: 379px)");
        const resize = () => {
            setItemsPerPage(short.matches ? 2 : narrow.matches ? 3 : 4);
            setPage(0);
        };
        resize();
        short.addEventListener("change", resize);
        narrow.addEventListener("change", resize);
        return () => {
            short.removeEventListener("change", resize);
            narrow.removeEventListener("change", resize);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        setStatus("loading");
        async function loadProjects() {
            try {
                const response = await fetch("https://api.github.com/users/giuliocapecchi/repos?sort=created&direction=desc&per_page=100", { signal: controller.signal });
                if (!response.ok) throw new Error("GitHub is unavailable");
                const data: unknown = await response.json();
                if (!Array.isArray(data) || !data.every(isProject)) throw new Error("Invalid repository response");
                if (active) {
                    setProjects(data.filter(project => project.name !== "giuliocapecchi")
                        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
                    setPage(0);
                    setStatus("ready");
                }
            } catch {
                if (active) setStatus("error");
            } finally {
                window.clearTimeout(timeout);
            }
        }
        void loadProjects();
        return () => {
            active = false;
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [attempt]);

    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
    const visibleProjects = projects.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <div className="portfolio flex flex-col w-full min-w-0 p-5 sm:p-6 text-white">
            <header className="flex items-start justify-between gap-3 mb-5">
                <div>
                    <p className="text-xs uppercase tracking-widest text-purple-300 mb-1">On GitHub</p>
                    <h2 id="projects-heading" className="text-xl sm:text-2xl font-semibold tracking-tight">Recent projects</h2>
                </div>
                <a href="https://github.com/giuliocapecchi?tab=repositories" target="_blank" rel="noopener noreferrer"
                    className="all-projects text-sm text-white/70 hover:text-white py-2 shrink-0">
                    View all <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-1 text-xs" />
                </a>
            </header>
            {status === "loading" && <p role="status" className="project-message">Loading projects…</p>}
            {status === "error" && <div role="status" className="project-message">
                <p>Projects couldn’t load. You can still browse them on GitHub.</p>
                <button className="glass-button mt-4" onClick={() => setAttempt(value => value + 1)}>Try again</button>
            </div>}
            {status === "ready" && projects.length === 0 && <p role="status" className="project-message">No public projects to show yet.</p>}
            {status === "ready" && projects.length > 0 && <>
                <ul className="flex flex-col gap-3 w-full">
                    {visibleProjects.map(project => <li key={project.id}>
                        <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="project-card block rounded-xl px-4 py-3">
                            <span className="font-semibold flex items-start gap-2 text-base">
                                <FontAwesomeIcon icon={faGithubSquare} className="text-purple-300 mt-1 shrink-0" />
                                <span className="min-w-0 break-words">{project.name}</span>
                            </span>
                            {project.description && <p className="mt-1 text-white/70 text-sm leading-relaxed line-clamp-2">{project.description}</p>}
                        </a>
                    </li>)}
                </ul>
                <nav aria-label="Project pages" className="flex justify-between mt-auto pt-4 items-center">
                    <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page" className="pagination-button">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <span aria-live="polite" aria-atomic="true" className="text-white/70 text-sm tabular-nums">{currentPage + 1} / {totalPages}</span>
                    <button onClick={() => setPage(currentPage + 1)} disabled={currentPage + 1 >= totalPages} aria-label="Next page" className="pagination-button">
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </nav>
            </>}
        </div>
    );
}
