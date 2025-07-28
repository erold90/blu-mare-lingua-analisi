import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Home, 
  LayoutDashboard, 
  Calendar, 
  Building, 
  Euro, 
  Sparkles, 
  Images, 
  BarChart3, 
  Settings 
} from "lucide-react";

const routeMap: Record<string, { title: string; icon: React.ElementType }> = {
  "/area-riservata": { title: "Area Riservata", icon: Home },
  "/area-riservata/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/area-riservata/prenotazioni": { title: "Prenotazioni", icon: Calendar },
  "/area-riservata/appartamenti": { title: "Appartamenti", icon: Building },
  "/area-riservata/prezzi": { title: "Prezzi", icon: Euro },
  "/area-riservata/pulizie": { title: "Pulizie", icon: Sparkles },
  "/area-riservata/immagini": { title: "Immagini", icon: Images },
  "/area-riservata/analytics": { title: "Analytics", icon: BarChart3 },
  "/area-riservata/impostazioni": { title: "Impostazioni", icon: Settings },
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  const breadcrumbs = pathSegments.reduce((acc, segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const route = routeMap[path];
    
    if (route) {
      acc.push({
        path,
        title: route.title,
        icon: route.icon,
        isLast: index === pathSegments.length - 1
      });
    }
    
    return acc;
  }, [] as Array<{ path: string; title: string; icon: React.ElementType; isLast: boolean }>);

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => {
            const Icon = breadcrumb.icon;
            
            return (
              <React.Fragment key={breadcrumb.path}>
                <BreadcrumbItem>
                  {breadcrumb.isLast ? (
                    <BreadcrumbPage className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {breadcrumb.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.path} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {breadcrumb.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!breadcrumb.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}