import React from 'react';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const Header = ({ keycloak }) => {
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                            E-Commerce Platform
                        </h1>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-600" />
                                <span className="text-muted-foreground">User:</span>
                                <span className="font-medium">{keycloak.idTokenParsed?.preferred_username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-purple-600" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{keycloak.idTokenParsed?.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-muted-foreground">Roles:</span>
                            <div className="flex flex-wrap gap-1">
                                {keycloak.tokenParsed?.realm_access?.roles?.map(role => (
                                    <Badge key={role} variant="default">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => keycloak.logout()}
                        className="w-full md:w-auto"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Header;

